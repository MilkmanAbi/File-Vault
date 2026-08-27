#include "input.h"
#include <algorithm>
#include <wchar.h>

namespace ytui {

// ─── helpers ──────────────────────────────────────────────────────────────────

static int calc_max_visible(const AppState& s) {
    int start_y = 7, end_y = s.term_h - 4;
    return std::max(1, end_y - start_y - 1);
}

static void clamp_scroll(AppState& s) {
    int mv = calc_max_visible(s);
    if (s.selected_result >= s.results_scroll + mv)
        s.results_scroll = s.selected_result - mv + 1;
    if (s.selected_result < s.results_scroll)
        s.results_scroll = s.selected_result;
    int max_s = std::max(0, (int)s.results.size() - mv);
    s.results_scroll = std::clamp(s.results_scroll, 0, max_s);
}

static void utf8_pop_back(std::string& s) {
    if (s.empty()) return;
    size_t i = s.size() - 1;
    while (i > 0 && ((unsigned char)s[i] & 0xC0) == 0x80) i--;
    s.erase(i);
}

// ─── streamlined-mode input ───────────────────────────────────────────────────
// Returns true when a search should be run (same contract as handle()).
//
// Touch/tap support: a single tap does what Enter would do at that row, not
// just move the selection -- two-step "tap to highlight, tap again to
// confirm" is exactly the kind of precision phone touchscreens are bad at.
// Row math below must stay in sync with the matching render function in
// tui.cpp (stream_menu / stream_browse / stream_actions) -- same duplication
// tradeoff the normal-mode mouse handler above already makes.
static bool stream_handle(int ch, AppState& state) {
    auto is_enter = [](int c){ return c == '\n' || c == '\r' || c == KEY_ENTER; };
    auto is_back  = [](int c){ return c == KEY_BACKSPACE || c == 127 || c == 8; };
    auto items = stream_menu_items(state);
    int n = (int)items.size();
    StreamScreen screen = (StreamScreen)state.stream_screen;

    auto nav_push = [&](StreamScreen to) {
        state.stream_nav_stack.push_back(state.stream_screen);
        state.stream_screen = (int)to;
    };
    auto nav_back = [&]() {
        if (!state.stream_nav_stack.empty()) {
            state.stream_screen = state.stream_nav_stack.back();
            state.stream_nav_stack.pop_back();
        } else {
            state.stream_screen = (int)StreamScreen::Menu;
        }
    };
    // For actions that COMPLETE a flow (save, add-to-playlist, create
    // playlist, set timer): unwind the whole sub-dialog chain in one go and
    // land back on the original Browse/Playing screen, not just one level
    // up into whichever intermediate screen was used to get here.
    auto nav_pop_all = [&]() {
        while (!state.stream_nav_stack.empty()) {
            state.stream_screen = state.stream_nav_stack.back();
            state.stream_nav_stack.pop_back();
        }
    };

    // Decode a tap once; each screen below maps it to "the row under my
    // finger", then falls into the exact same handling Enter would trigger.
    bool tapped = false;
    int tap_y = -1, tap_x = -1;
    if (ch == KEY_MOUSE) {
        MEVENT ev;
        if (getmouse(&ev) != OK) return false;
        if (!(ev.bstate & (BUTTON1_PRESSED | BUTTON1_CLICKED))) return false;
        tapped = true; tap_y = ev.y; tap_x = ev.x;
    }

    // ── Header ‹Back / Menu≡ (row 0) ────────────────────────────────────────
    // Handled once, here, for every screen -- this is the touch-only
    // replacement for Esc/Ctrl combos. Zones must stay in sync with
    // TUI::stream_header(): back is columns [0,3), menu is the rightmost 6.
    // Matching a tap here converts it into the same synthetic key every
    // per-screen case below already understands (ch=27 for back), and clears
    // `tapped` so the per-screen tap-to-activate math never sees this event
    // -- row 0 is never a valid list row for any of them.
    if (tapped && tap_y <= 1) {
        bool on_sub_dialog = (screen == StreamScreen::MiniMenu ||
                               screen == StreamScreen::PlaylistPick ||
                               screen == StreamScreen::NewPlaylistName ||
                               screen == StreamScreen::TimerInput);
        // Back is shown on every page now. On the root Menu, it quits.
        if (tap_x < 3) {
            if (on_sub_dialog) { nav_back(); return false; }
            if (screen == StreamScreen::Menu) { state.running = false; return false; }
            ch = 27; tapped = false;   // fall through to each screen's own 'b'/27 handling
        } else {
            bool menu_shown = (screen == StreamScreen::Browse &&
                                !state.stream_on_playlists && !state.results.empty()) ||
                               (screen == StreamScreen::Playing);
            if (menu_shown && tap_x >= state.term_w - 5) {
                nav_push(StreamScreen::MiniMenu);
                state.stream_minimenu_sel = 0;
                return false;
            }
        }
    }

    switch (screen) {
        case StreamScreen::Menu:
            if (tapped) {
                int row = tap_y - 3;  // top=3 in TUI::stream_menu
                if (row < 0 || row >= n) return false;
                state.stream_menu_sel = row;
                ch = '\n';  // fall into the same is_enter(ch) branch below
            }
            if (ch == 'j' || ch == KEY_DOWN) state.stream_menu_sel = std::min(state.stream_menu_sel + 1, n - 1);
            else if (ch == 'k' || ch == KEY_UP) state.stream_menu_sel = std::max(state.stream_menu_sel - 1, 0);
            else if (ch == 'q') state.running = false;
            else if (is_enter(ch)) {
                std::string sel = items[std::clamp(state.stream_menu_sel, 0, n - 1)];
                state.selected_result = 0;
                if (sel == "Search")         { state.stream_screen = (int)StreamScreen::Search; state.search_query.clear(); }
                else if (sel == "Library")   state.status_message = "__STREAM_SEC_LIBRARY__";
                else if (sel == "Playlists") state.status_message = "__STREAM_SEC_PLAYLISTS__";
                else if (sel == "Feed")      state.status_message = "__STREAM_SEC_FEED__";
                else if (sel == "History")   state.status_message = "__STREAM_SEC_HISTORY__";
                else if (sel == "Now Playing") state.stream_screen = (int)StreamScreen::Playing;
            }
            return false;

        case StreamScreen::Search:
            if (ch == 27) state.stream_screen = (int)StreamScreen::Menu;
            else if (is_enter(ch)) { if (!state.search_query.empty()) return true; }
            else if (is_back(ch)) utf8_pop_back(state.search_query);
            else if (ch >= 32 && ch < 256 && ch != 127) state.search_query += (char)ch;
            return false;

        case StreamScreen::Browse: {
            int count = state.stream_on_playlists ? (int)state.playlist_names.size()
                                                  : (int)state.results.size();
            if (tapped) {
                int top = 3;
                // Playlist-name rows are 1 line each; video results are 2
                // (title + channel/duration) -- matches stream_browse().
                int rows_per = state.stream_on_playlists ? 1 : 2;
                int row = (tap_y - top) / rows_per;
                if (row < 0) return false;
                // start-of-window scroll offset, same formula as the renderer.
                int vis = state.stream_on_playlists ? std::max(1, state.term_h - 5)
                                                     : std::max(1, (state.term_h - 4) / rows_per);
                int start = (state.selected_result >= vis) ? state.selected_result - vis + 1 : 0;
                int idx = start + row;
                if (idx < 0 || idx >= count) return false;
                state.selected_result = idx;
                ch = '\n';  // fall into is_enter(ch) below
            }
            if (ch == 'j' || ch == KEY_DOWN) state.selected_result = std::min(state.selected_result + 1, std::max(0, count - 1));
            else if (ch == 'k' || ch == KEY_UP) state.selected_result = std::max(state.selected_result - 1, 0);
            else if (ch == 'b' || ch == 27) state.stream_screen = (int)StreamScreen::Menu;
            else if (ch == 'q') state.running = false;
            else if (is_enter(ch) && count > 0) {
                if (state.stream_on_playlists) state.status_message = "__STREAM_OPEN_PLAYLIST__";
                else if (state.force_audio_only) state.status_message = "__STREAM_PLAY_AUDIO__";
                else { state.stream_screen = (int)StreamScreen::Actions; state.stream_action_sel = 0; }
            }
            return false;
        }

        case StreamScreen::Actions:
            if (tapped) {
                // Two centered rows starting at max(3, H/2-3)+3 in stream_actions().
                int top = std::max(3, state.term_h / 2 - 3) + 3;
                int row = tap_y - top;
                if (row < 0 || row > 1) return false;
                state.stream_action_sel = row;
                ch = '\n';
            }
            if (ch == 'j' || ch == KEY_DOWN) state.stream_action_sel = 1;
            else if (ch == 'k' || ch == KEY_UP) state.stream_action_sel = 0;
            else if (ch == 'b' || ch == 27) state.stream_screen = (int)StreamScreen::Browse;
            else if (ch == 'q') state.running = false;
            else if (is_enter(ch))
                state.status_message = state.stream_action_sel == 0 ? "__STREAM_PLAY_VIDEO__"
                                                                    : "__STREAM_PLAY_AUDIO__";
            return false;

        case StreamScreen::Playing: {
            // Two tap targets: the waveform (seek to the tapped position,
            // bounds set by TUI::stream_playing() each frame it draws one —
            // its Y shifts with whether a thumbnail rendered above it, so we
            // read state.waveform_* rather than re-deriving that layout) and
            // the transport row, pinned at a fixed position (H-3). Tapping
            // empty space (title, gap) is intentionally a no-op, NOT pause —
            // the old "tap anywhere = pause" design meant every stray touch
            // in a pocket stopped playback.
            int transport_y = state.term_h - 3;
            if (transport_y < 6) transport_y = 6;
            if (tapped) {
                if (state.waveform_y >= 0 && tap_y == state.waveform_y &&
                    state.waveform_w > 0 && state.playback_dur > 0.5) {
                    int off = tap_x - state.waveform_x;
                    if (off >= 0 && off < state.waveform_w) {
                        double frac = (double)off / (double)state.waveform_w;
                        state.stream_seek_target = frac * state.playback_dur;
                        state.status_message = "__SEEK_TO__";
                    }
                } else if (tap_y >= transport_y - 1 && tap_y <= transport_y + 1) {
                    int col_w = std::max(1, state.term_w / 3);
                    int col = tap_x / col_w; if (col > 2) col = 2;
                    if (col == 0)      state.status_message = "__VOLUME_DOWN__";
                    else if (col == 1) state.status_message = "__PAUSE_TOGGLE__";
                    else               state.status_message = "__VOLUME_UP__";
                }
                // Taps outside both zones: intentional no-op.
                return false;
            }
            if (ch == ' ') state.status_message = "__PAUSE_TOGGLE__";
            else if (ch == '+') state.status_message = "__VOLUME_UP__";
            else if (ch == '-') state.status_message = "__VOLUME_DOWN__";
            else if (ch == '>' || ch == KEY_RIGHT) state.status_message = "__SEEK_FWD__";
            else if (ch == '<' || ch == KEY_LEFT)  state.status_message = "__SEEK_BACK__";
            else if (ch == 'b' || ch == 27)
                state.stream_screen = state.results.empty() ? (int)StreamScreen::Menu : (int)StreamScreen::Browse;
            else if (ch == 'q') state.running = false;
            return false;
        }

        case StreamScreen::MiniMenu: {
            auto mitems = stream_minimenu_items(state);
            int mn = (int)mitems.size();
            if (tapped) {
                int row = tap_y - 3;
                if (row < 0 || row >= mn) return false;
                state.stream_minimenu_sel = row;
                ch = '\n';
            }
            if (ch == 'j' || ch == KEY_DOWN) state.stream_minimenu_sel = std::min(state.stream_minimenu_sel + 1, mn - 1);
            else if (ch == 'k' || ch == KEY_UP) state.stream_minimenu_sel = std::max(state.stream_minimenu_sel - 1, 0);
            else if (ch == 'b' || ch == 27) nav_back();
            else if (ch == 'q') state.running = false;
            else if (is_enter(ch) && mn > 0) {
                std::string sel = mitems[std::clamp(state.stream_minimenu_sel, 0, mn - 1)];
                if (sel == "Save to Library") {
                    nav_pop_all();
                    state.status_message = "__STREAM_SAVE__";
                } else if (sel == "Add to Playlist") {
                    nav_push(StreamScreen::PlaylistPick);
                    state.stream_minimenu_sel = 0;
                    state.status_message = "__STREAM_REFRESH_PLAYLISTS__";
                } else if (sel == "Sleep Timer...") {
                    nav_push(StreamScreen::TimerInput);
                    state.stream_timer_input.clear();
                }
            }
            return false;
        }

        case StreamScreen::PlaylistPick: {
            int count = (int)state.playlist_names.size();
            if (tapped) {
                int row = tap_y - 3;
                if (row < 0 || row >= count) return false;
                state.stream_minimenu_sel = row;
                ch = '\n';
            }
            if (ch == 'j' || ch == KEY_DOWN) state.stream_minimenu_sel = std::min(state.stream_minimenu_sel + 1, std::max(0, count - 1));
            else if (ch == 'k' || ch == KEY_UP) state.stream_minimenu_sel = std::max(state.stream_minimenu_sel - 1, 0);
            else if (ch == 'b' || ch == 27) nav_back();
            else if (ch == 'q') state.running = false;
            else if (is_enter(ch) && count > 0) {
                if (state.stream_minimenu_sel == 0) {   // "+ Create new playlist"
                    nav_push(StreamScreen::NewPlaylistName);
                    state.new_playlist_name.clear();
                } else {
                    nav_pop_all();
                    state.status_message = "__STREAM_ADD_TO_PLAYLIST__";
                }
            }
            return false;
        }

        case StreamScreen::NewPlaylistName:
            if (ch == 27) nav_back();
            else if (is_enter(ch)) {
                if (!state.new_playlist_name.empty()) {
                    nav_pop_all();
                    state.status_message = "__STREAM_CREATE_PLAYLIST__";
                }
            }
            else if (is_back(ch)) utf8_pop_back(state.new_playlist_name);
            else if (ch >= 32 && ch < 256 && ch != 127) state.new_playlist_name += (char)ch;
            return false;

        case StreamScreen::TimerInput:
            if (ch == 27) nav_back();
            else if (is_enter(ch)) {
                if (!state.stream_timer_input.empty()) {
                    nav_pop_all();
                    state.status_message = "__STREAM_SET_TIMER__";
                }
            }
            else if (is_back(ch)) utf8_pop_back(state.stream_timer_input);
            else if (ch >= 32 && ch < 256 && ch != 127) state.stream_timer_input += (char)ch;
            return false;
    }
    return false;
}

// ─── main handler ─────────────────────────────────────────────────────────────

bool InputHandler::handle(int ch, AppState& state) {
    if (ch == ERR) return false;

    // Narrow-terminal streamlined UI has its own, simpler navigation.
    if (state.ui_mode == 1) return stream_handle(ch, state);

    // ── Mouse ────────────────────────────────────────────────────────────────
    if (ch == KEY_MOUSE) {
        MEVENT ev;
        if (getmouse(&ev) != OK) return false;

        // Scroll wheel — route by current focus context
        auto scroll_results = [&](int dir) {
            if (state.results.empty()) return;
            int n = (int)state.results.size();
            state.selected_result = std::clamp(state.selected_result + dir, 0, n - 1);
            clamp_scroll(state);
            state.focus = Panel::Results;
        };

        if (ev.bstate & BUTTON4_PRESSED) {
            if      (state.focus == Panel::Actions)        { if (state.selected_action > 0) state.selected_action--; }
            else if (state.focus == Panel::BrowserPick)    { if (state.browser_pick_idx > 0) state.browser_pick_idx--; }
            else if (state.focus == Panel::PlaylistList)   { if (state.selected_playlist > 0) state.selected_playlist--; }
            else if (state.focus == Panel::PlaylistView)   { if (state.playlist_video_idx > 0) state.playlist_video_idx--; }
            else if (state.focus == Panel::PlaylistActions){ if (state.selected_action > 0) state.selected_action--; }
            else scroll_results(-1);
            return false;
        }
        if (ev.bstate & BUTTON5_PRESSED) {
            if      (state.focus == Panel::Actions)        { if (state.selected_action < (int)state.actions.size()-1) state.selected_action++; }
            else if (state.focus == Panel::BrowserPick)    { if (state.browser_pick_idx < (int)state.browser_choices.size()-1) state.browser_pick_idx++; }
            else if (state.focus == Panel::PlaylistList)   { state.selected_playlist++; /* clamped in render */ }
            else if (state.focus == Panel::PlaylistView)   { state.playlist_video_idx++; /* clamped in render */ }
            else if (state.focus == Panel::PlaylistActions){ if (state.selected_action < (int)state.actions.size()-1) state.selected_action++; }
            else scroll_results(+1);
            return false;
        }

        if (!(ev.bstate & (BUTTON1_PRESSED | BUTTON1_CLICKED))) return false;

        int my = ev.y, mx = ev.x;

        // Search / hamburger row (rows 1-3)
        if (my >= 1 && my <= 3) {
            if (mx >= state.term_w - 5) {
                state.sort_col = 0; state.sort_row = 0;
                state.focus = Panel::SortMenu;
            } else {
                state.focus = Panel::Search;
            }
            return false;
        }

        // Tab bar (rows 4-6)
        if (my >= 4 && my <= 6) {
            // Calculate tab positions matching draw_tabs()
            bool has_results = !state.results.empty();
            int n_tabs = has_results ? 5 : 4;
            // Tabs: Library, Playlists, Feed, History, [Results]
            const Tab tab_order[] = {
                Tab::Library, Tab::Playlists, Tab::Feed, Tab::History, Tab::Results
            };
            int tab_w = std::max(8, std::min(14, (state.term_w - 2) / n_tabs - 2));
            int total_w = tab_w * n_tabs + 2 * (n_tabs - 1);
            int start_x = std::max(0, (state.term_w - total_w) / 2);

            Tab clicked = state.active_tab;
            for (int i = 0; i < n_tabs; i++) {
                int tx = start_x + i * (tab_w + 2);
                if (mx >= tx && mx < tx + tab_w) {
                    clicked = tab_order[i];
                    break;
                }
            }
            state.active_tab = clicked;
            // Set appropriate focus for the new tab
            if (clicked == Tab::Results && has_results)
                state.focus = Panel::Results;
            else if (clicked == Tab::Playlists)
                state.focus = Panel::PlaylistList;
            else
                state.focus = Panel::Tabs;
            return false;
        }

        // Main content area
        int start_y = 7, end_y = state.term_h - 4;
        if (my <= start_y || my >= end_y) return false;

        // Playlist list tab
        if (state.active_tab == Tab::Playlists &&
            (state.focus == Panel::PlaylistList || state.focus == Panel::Tabs)) {
            int row_idx = my - start_y - 3; // offset for header rows
            if (row_idx >= 0) {
                state.selected_playlist = row_idx + state.playlist_scroll;
                state.focus = Panel::PlaylistList;
            }
            return false;
        }

        // Playlist view (video list inside a playlist)
        if (state.focus == Panel::PlaylistView || state.focus == Panel::PlaylistActions) {
            int lw = state.term_w * 60 / 100;
            if (lw < 20) lw = 20;
            if (mx < lw) {
                int vid_idx = (my - start_y - 2) + state.playlist_video_scroll;
                if (vid_idx >= 0) {
                    if (state.playlist_video_idx == vid_idx && state.focus == Panel::PlaylistView) {
                        state.focus = Panel::PlaylistActions;
                        state.actions_visible = true;
                        state.selected_action = 0;
                    } else {
                        state.playlist_video_idx = vid_idx;
                        state.focus = Panel::PlaylistView;
                        state.actions_visible = false;
                    }
                }
            } else {
                state.focus = Panel::PlaylistActions;
            }
            return false;
        }

        // ── Home tabs: History / Feed / Library ───────────────────────────────
        // Any click on a video row in a home tab searches for that title and
        // navigates to Results, where the user can pick play mode freely.
        if (state.active_tab == Tab::History ||
            state.active_tab == Tab::Feed    ||
            state.active_tab == Tab::Library) {
            // History: rows start at sy+3 (header at sy+1, column labels at sy+2)
            // Feed left panel: rows start at sy+2 (pairs: title + channel, 2 rows each)
            // Library left/right panels: single row items starting at sy+2
            // We use a simple heuristic: any click on a content row >= sy+2 picks an item.
            int lw = state.term_w * 60 / 100; // left panel width for split views
            bool is_right = (mx >= lw) && (state.active_tab == Tab::Feed || state.active_tab == Tab::Library);

            if (!is_right) {
                // Left panel or full-width (History)
                int first_row = (state.active_tab == Tab::History) ? start_y + 3 : start_y + 2;
                if (my >= first_row) {
                    int raw_idx = my - first_row;
                    // Feed uses 2-row-per-item layout
                    int item_idx = (state.active_tab == Tab::Feed) ? raw_idx / 2 : raw_idx;
                    state.home_selected_idx = item_idx;
                    state.focus = Panel::Tabs; // keeps keyboard on this tab
                    state.status_message = "__HOME_SEARCH__";
                }
            }
            return false;
        }

        // Results / actions panels — claim focus immediately so j/k works
        state.focus = Panel::Results;

        if (state.actions_visible) {
            int lw = state.term_w * 30 / 100;
            if (lw < 15) lw = 15;
            if (mx <= lw) {
                state.focus = Panel::Results;
                state.actions_visible = false;
            } else {
                int action_idx = my - start_y - 1;
                if (action_idx >= 0 && action_idx < (int)state.actions.size()) {
                    state.selected_action = action_idx;
                    state.focus = Panel::Actions;
                    state.status_message = "__EXEC_ACTION__";
                } else {
                    state.focus = Panel::Actions;
                }
            }
        } else {
            int lw = state.term_w * 60 / 100;
            if (lw < 20) lw = 20;
            if (mx < lw && !state.results.empty()) {
                int result_idx = (my - start_y - 1) + state.results_scroll;
                if (result_idx >= 0 && result_idx < (int)state.results.size()) {
                    if (state.selected_result == result_idx) {
                        state.actions_visible = true;
                        state.focus = Panel::Actions;
                        state.selected_action = 0;
                    } else {
                        state.selected_result = result_idx;
                        clamp_scroll(state);
                    }
                }
            }
        }
        return false;
    }

    // ── Popups (intercept before global keys) ────────────────────────────────
    if (state.focus == Panel::Shortcuts) {
        state.show_shortcuts = false;
        // Return focus to wherever makes sense
        if (!state.results.empty()) state.focus = Panel::Results;
        else state.focus = Panel::Search;
        return false;
    }
    if (state.focus == Panel::BrowserPick)    { handle_browser_pick(ch, state);    return false; }
    if (state.focus == Panel::SortMenu)       { handle_sort_menu(ch, state);       return false; }
    if (state.focus == Panel::SavePrompt)     { handle_save_prompt(ch, state);     return false; }
    if (state.focus == Panel::PlaylistPick)   { handle_playlist_pick(ch, state);   return false; }
    if (state.focus == Panel::NewPlaylist)    { handle_new_playlist(ch, state);    return false; }
    if (state.focus == Panel::PlaylistView)   { handle_playlist_view(ch, state);   return false; }
    if (state.focus == Panel::PlaylistActions){ handle_playlist_actions(ch, state); return false; }
    if (state.focus == Panel::PlaylistList)   { handle_playlist_list(ch, state);   return false; }

    // ── Global keys (configurable via Ctrl-S settings) ───────────────────────
    // These honour the live keybindings so rebinds actually take effect. They
    // run before the per-panel switch below, so a configured key wins over the
    // panel's built-in navigation. Search is exempt (typing must reach the box).
    const Config::KeyBindings& k = kb();
    bool in_search = (state.focus == Panel::Search);

    if (!in_search && state.is_playing && (ch == k.pause || ch == 'p')) {
        state.status_message = "__PAUSE_TOGGLE__";
        return false;
    }
    if (!in_search && state.is_playing && ch == k.volume_up) {
        state.status_message = "__VOLUME_UP__";
        return false;
    }
    if (!in_search && state.is_playing && ch == k.volume_down) {
        state.status_message = "__VOLUME_DOWN__";
        return false;
    }
    if (!in_search && state.is_playing && ch == k.seek_fwd) {
        state.status_message = "__SEEK_FWD__";
        return false;
    }
    if (!in_search && state.is_playing && ch == k.seek_back) {
        state.status_message = "__SEEK_BACK__";
        return false;
    }
    if (!in_search && ch == '?') {
        state.show_shortcuts = !state.show_shortcuts;
        if (state.show_shortcuts)
            state.focus = Panel::Shortcuts;
        return false;
    }
    if (!in_search && ch == k.quit) {
        state.running = false;
        return false;
    }
    // Search: jump to the search box from anywhere (true global accelerator).
    // Works even from Results, Actions, or any other panel. Honours a rebound
    // search key. The per-panel handler in handle_results_input is now
    // unreachable for this key but left for clarity.
    if (!in_search && ch == k.search) {
        state.focus = Panel::Search;
        return false;
    }

    // Tab key cycles focus
    if (ch == '\t') {
        switch (state.focus) {
            case Panel::Search:
                state.focus = Panel::Tabs;
                break;
            case Panel::Tabs:
                if (state.active_tab == Tab::Results && !state.results.empty())
                    state.focus = Panel::Results;
                else if (state.active_tab == Tab::Playlists)
                    state.focus = Panel::PlaylistList;
                else
                    state.focus = Panel::Search;
                break;
            case Panel::Results:
                state.focus = Panel::Search;
                break;
            case Panel::Actions:
                state.focus = Panel::Results;
                state.actions_visible = false;
                break;
            default:
                state.focus = Panel::Search;
                break;
        }
        return false;
    }

    // Escape — always navigate outward, never leave user stranded
    if (ch == 27) {
        switch (state.focus) {
            case Panel::Actions:
                state.focus = Panel::Results;
                state.actions_visible = false;
                break;
            case Panel::PlaylistActions:
                state.focus = Panel::PlaylistView;
                state.actions_visible = false;
                break;
            case Panel::PlaylistView:
                state.focus = Panel::Tabs;
                state.active_tab = Tab::Playlists;
                state.current_playlist_id.clear();
                break;
            case Panel::Results:
                // Re-run search so user can pick a different video.
                // Signal app.cpp to re-search the current query.
                state.focus = Panel::Search;
                state.active_tab = Tab::Results;
                state.status_message = "__RESEARCH__";
                break;
            default:
                state.focus = Panel::Search;
                break;
        }
        return false;
    }

    switch (state.focus) {
        case Panel::Search:  return handle_search_input(ch, state);
        case Panel::Tabs:    handle_tabs_input(ch, state);    return false;
        case Panel::Results: handle_results_input(ch, state); return false;
        case Panel::Actions: handle_actions_input(ch, state); return false;
        default: return false;
    }
}

// ─── Search input ─────────────────────────────────────────────────────────────

bool InputHandler::handle_search_input(int ch, AppState& state) {
    switch (ch) {
        case KEY_BACKSPACE: case 127: case 8:
            utf8_pop_back(state.search_query);
            return false;
        case '\n': case KEY_ENTER:
            return true;
        case KEY_DC:
            state.search_query.clear();
            return false;
        case KEY_DOWN:
            state.focus = !state.results.empty() ? Panel::Results : Panel::Tabs;
            return false;
        default:
            if (ch >= 32 && ch < 127) {
                state.search_query += (char)ch;
            } else if (ch >= 128) {
                unsigned char lead = (unsigned char)ch;
                int need = 0;
                if      ((lead & 0xE0) == 0xC0) need = 1;
                else if ((lead & 0xF0) == 0xE0) need = 2;
                else if ((lead & 0xF8) == 0xF0) need = 3;
                else return false;
                state.search_query += (char)ch;
                timeout(50);
                for (int i = 0; i < need; i++) {
                    int b = getch();
                    if (b == ERR || (b & 0xC0) != 0x80) { state.search_query.pop_back(); break; }
                    state.search_query += (char)b;
                }
                timeout(100);
            }
            return false;
    }
}

// ─── Tab bar navigation ───────────────────────────────────────────────────────

void InputHandler::handle_tabs_input(int ch, AppState& state) {
    bool has_results = !state.results.empty();
    // Tab order: Library(0) → Playlists(1) → Feed(2) → History(3) → Results(4)
    auto tab_left = [&]() {
        switch (state.active_tab) {
            case Tab::Playlists: state.active_tab = Tab::Library;   break;
            case Tab::Feed:      state.active_tab = Tab::Playlists; break;
            case Tab::History:   state.active_tab = Tab::Feed;      break;
            case Tab::Results:   state.active_tab = Tab::History;   break;
            default: break;
        }
    };
    auto tab_right = [&]() {
        switch (state.active_tab) {
            case Tab::Library:   state.active_tab = Tab::Playlists; break;
            case Tab::Playlists: state.active_tab = Tab::Feed;      break;
            case Tab::Feed:      state.active_tab = Tab::History;   break;
            case Tab::History:   if (has_results) state.active_tab = Tab::Results; break;
            default: break;
        }
    };

    // Is current tab a home content tab with a navigable list?
    bool is_home_tab = (state.active_tab == Tab::History ||
                        state.active_tab == Tab::Feed    ||
                        state.active_tab == Tab::Library);

    switch (ch) {
        case 'h': case KEY_LEFT:
            if (is_home_tab) { state.home_selected_idx = 0; }
            tab_left();
            break;
        case 'l': case KEY_RIGHT:
            if (is_home_tab) { state.home_selected_idx = 0; }
            tab_right();
            break;
        case 'j': case KEY_DOWN:
            if (is_home_tab) {
                state.home_selected_idx++;  // clamped in app render loop
            } else if (state.active_tab == Tab::Results && has_results) {
                state.focus = Panel::Results;
            } else if (state.active_tab == Tab::Playlists) {
                state.focus = Panel::PlaylistList;
            }
            break;
        case 'k': case KEY_UP:
            if (is_home_tab) {
                if (state.home_selected_idx > 0) state.home_selected_idx--;
                else state.focus = Panel::Search;
            } else {
                state.focus = Panel::Search;
            }
            break;
        case '\n': case KEY_ENTER:
            if (is_home_tab) {
                state.status_message = "__HOME_SEARCH__";
            } else if (state.active_tab == Tab::Results && has_results) {
                state.focus = Panel::Results;
            } else if (state.active_tab == Tab::Playlists) {
                state.focus = Panel::PlaylistList;
            }
            break;
    }
}

// ─── Results list ─────────────────────────────────────────────────────────────

void InputHandler::handle_results_input(int ch, AppState& state) {
    int total = (int)state.results.size();
    if (total == 0) return;
    const Config::KeyBindings& k = kb();

    // Configurable keys first (an if-ladder, since switch needs constants).
    // Arrow keys and Enter/l stay always-available regardless of rebinds.
    if (ch == k.scroll_down || ch == KEY_DOWN) {
        if (state.selected_result < total - 1) { state.selected_result++; clamp_scroll(state); }
        return;
    }
    if (ch == k.scroll_up || ch == KEY_UP) {
        if (state.selected_result > 0) { state.selected_result--; clamp_scroll(state); }
        else state.focus = Panel::Tabs;
        return;
    }
    if (ch == k.top)    { state.selected_result = 0; state.results_scroll = 0; return; }
    if (ch == k.bottom) { state.selected_result = total - 1; clamp_scroll(state); return; }
    if (ch == k.sort)   { state.sort_col = 0; state.sort_row = 0; state.focus = Panel::SortMenu; return; }

    switch (ch) {
        case '\n': case KEY_ENTER: case 'l': case KEY_RIGHT:
            state.actions_visible = true;
            state.focus = Panel::Actions;
            state.selected_action = 0;
            break;
    }
}

// ─── Action menu ──────────────────────────────────────────────────────────────

void InputHandler::handle_actions_input(int ch, AppState& state) {
    int total = (int)state.actions.size();
    if (total == 0) return;
    switch (ch) {
        case 'j': case KEY_DOWN:
            if (state.selected_action < total - 1) state.selected_action++;
            break;
        case 'k': case KEY_UP:
            if (state.selected_action > 0) state.selected_action--;
            break;
        case '\n': case KEY_ENTER:
            state.status_message = "__EXEC_ACTION__";
            break;
        case 'h': case KEY_LEFT: case KEY_BACKSPACE:
            state.focus = Panel::Results;
            state.actions_visible = false;
            break;
    }
}

// ─── Browser picker ───────────────────────────────────────────────────────────

void InputHandler::handle_browser_pick(int ch, AppState& state) {
    int total = (int)state.browser_choices.size();
    switch (ch) {
        case 'j': case KEY_DOWN: if (state.browser_pick_idx < total - 1) state.browser_pick_idx++; break;
        case 'k': case KEY_UP:   if (state.browser_pick_idx > 0) state.browser_pick_idx--;          break;
        case '\n': case KEY_ENTER: state.status_message = "__BROWSER_PICKED__"; break;
        case 27: state.focus = Panel::Actions; state.browser_choices.clear(); break;
    }
}

// ─── Sort menu ────────────────────────────────────────────────────────────────

void InputHandler::handle_sort_menu(int ch, AppState& state) {
    int max_rows = (state.sort_col == 0) ? 4 : 6;
    switch (ch) {
        case 'j': case KEY_DOWN:  if (state.sort_row < max_rows - 1) state.sort_row++; break;
        case 'k': case KEY_UP:    if (state.sort_row > 0) state.sort_row--;             break;
        case 'h': case KEY_LEFT:  state.sort_col = 0; state.sort_row = std::min(state.sort_row, 3); break;
        case 'l': case KEY_RIGHT: state.sort_col = 1; state.sort_row = std::min(state.sort_row, 5); break;
        case '\n': case KEY_ENTER:
            state.status_message = "__SORT_APPLIED__";
            state.focus = state.results.empty() ? Panel::Search : Panel::Results;
            break;
        case 27:
            state.focus = state.results.empty() ? Panel::Search : Panel::Results;
            break;
    }
}

// ─── Save prompt ──────────────────────────────────────────────────────────────

void InputHandler::handle_save_prompt(int ch, AppState& state) {
    switch (ch) {
        case 'j': case KEY_DOWN: if (state.save_prompt_idx < 2) state.save_prompt_idx++; break;
        case 'k': case KEY_UP:   if (state.save_prompt_idx > 0) state.save_prompt_idx--; break;
        case '\n': case KEY_ENTER: state.status_message = "__SAVE_PICKED__"; break;
        case 27: state.focus = Panel::Actions; break;
    }
}

// ─── Playlist list ────────────────────────────────────────────────────────────

void InputHandler::handle_playlist_list(int ch, AppState& state) {
    switch (ch) {
        case 'j': case KEY_DOWN:
            state.selected_playlist++;  // clamped in app render loop
            break;
        case 'k': case KEY_UP:
            if (state.selected_playlist > 0) state.selected_playlist--;
            else state.focus = Panel::Tabs;
            break;
        case '\n': case KEY_ENTER: case 'l': case KEY_RIGHT:
            state.status_message = "__OPEN_PLAYLIST__";
            break;
        case 'n':
            // New playlist shortcut from list
            state.new_playlist_name.clear();
            state.focus = Panel::NewPlaylist;
            break;
        case '/':
            state.focus = Panel::Search;
            break;
    }
}

// ─── Playlist view (video list inside a playlist) ────────────────────────────

void InputHandler::handle_playlist_view(int ch, AppState& state) {
    switch (ch) {
        case 'j': case KEY_DOWN:
            state.playlist_video_idx++;  // clamped in render
            break;
        case 'k': case KEY_UP:
            if (state.playlist_video_idx > 0) state.playlist_video_idx--;
            else state.focus = Panel::Tabs;
            break;
        case '\n': case KEY_ENTER: case 'l': case KEY_RIGHT:
            state.actions_visible = true;
            state.focus = Panel::PlaylistActions;
            state.selected_action = 0;
            break;
        case 'h': case KEY_LEFT: case 27:
            state.focus = Panel::Tabs;
            state.active_tab = Tab::Playlists;
            state.current_playlist_id.clear();
            break;
        case '/':
            state.focus = Panel::Search;
            break;
    }
}

// ─── Playlist action menu ─────────────────────────────────────────────────────

void InputHandler::handle_playlist_actions(int ch, AppState& state) {
    int total = (int)state.actions.size();
    if (total == 0) return;
    switch (ch) {
        case 'j': case KEY_DOWN:
            if (state.selected_action < total - 1) state.selected_action++;
            break;
        case 'k': case KEY_UP:
            if (state.selected_action > 0) state.selected_action--;
            break;
        case '\n': case KEY_ENTER:
            state.status_message = "__PLAYLIST_ACTION__";
            break;
        case 'h': case KEY_LEFT: case KEY_BACKSPACE: case 27:
            state.focus = Panel::PlaylistView;
            state.actions_visible = false;
            break;
    }
}

// ─── "Add to playlist" picker popup ──────────────────────────────────────────

void InputHandler::handle_playlist_pick(int ch, AppState& state) {
    int total = (int)state.playlist_names.size();
    switch (ch) {
        case 'j': case KEY_DOWN: if (state.playlist_pick_idx < total - 1) state.playlist_pick_idx++; break;
        case 'k': case KEY_UP:   if (state.playlist_pick_idx > 0) state.playlist_pick_idx--;          break;
        case '\n': case KEY_ENTER: state.status_message = "__PLAYLIST_PICKED__"; break;
        case 27:
            state.focus = Panel::Actions;
            break;
    }
}

// ─── New playlist name dialog ─────────────────────────────────────────────────

void InputHandler::handle_new_playlist(int ch, AppState& state) {
    switch (ch) {
        case KEY_BACKSPACE: case 127: case 8:
            utf8_pop_back(state.new_playlist_name);
            break;
        case '\n': case KEY_ENTER:
            if (!state.new_playlist_name.empty())
                state.status_message = "__CREATE_PLAYLIST__";
            break;
        case 27:
            state.new_playlist_name.clear();
            // Return to wherever we came from
            if (!state.current_playlist_id.empty())
                state.focus = Panel::PlaylistView;
            else if (state.active_tab == Tab::Playlists)
                state.focus = Panel::PlaylistList;
            else
                state.focus = Panel::Actions;
            break;
        default:
            if (ch >= 32 && ch < 127 && state.new_playlist_name.size() < 60)
                state.new_playlist_name += (char)ch;
            break;
    }
}

} // namespace ytui

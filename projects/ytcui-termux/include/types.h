#pragma once

#include <string>
#include <vector>
#include "theme.h"

namespace ytui {

#ifdef YTUI_VERSION
constexpr const char* VERSION = YTUI_VERSION;
#else
constexpr const char* VERSION = "4.0.0";
#endif

struct Video {
    std::string id;
    std::string title;
    std::string channel;
    std::string channel_id;
    std::string duration;
    int duration_seconds = 0;
    std::string view_count;
    std::string upload_date;
    std::string thumbnail_url;
    std::string url;
    std::string description;
    bool is_live = false;
};

enum class PlayMode { Video, Audio, AudioLoop };

enum class Panel {
    Search, Tabs, Results, Actions,
    BrowserPick, SortMenu, SavePrompt,
    // Playlist panels
    PlaylistList,     // Navigating the list of playlists
    PlaylistView,     // Viewing videos inside a playlist
    PlaylistActions,  // Action menu on a playlist video
    PlaylistPick,     // "Add to playlist" popup
    NewPlaylist,      // Name-entry dialog for new playlist
    Shortcuts,        // Keybinding reference popup (? to open)
    Settings,         // In-app settings UI (Ctrl-S): live theme + accelerators
};

enum class Tab { Library, Playlists, Feed, History, Results };

// Sub-screens of the narrow-terminal "Streamlined" music-player UI.
//   Menu    - iPod-style section picker (Search/Library/Playlists/Feed/History)
//   Search  - query entry
//   Browse  - a dense list (search results, saved, feed, history, or playlists)
//   Actions - play-video / play-audio chooser for the highlighted item
//   Playing - now-playing card
enum class StreamScreen { Menu, Search, Browse, Actions, Playing,
                          MiniMenu, PlaylistPick, NewPlaylistName, TimerInput };

enum class Action {
    PlayVideo, PlayAudio, PlayAudioLoop,
    PauseToggle,
    ViewChannel, OpenInBrowser,
    ToggleBookmark, SubscribeChannel,
    SaveToLibrary,
    AddToPlaylist,
    CopyURL, LoginBrowser, Logout,
    // Playlist-internal actions
    RemoveFromPlaylist,
    MoveUp, MoveDown,
};

struct ActionItem { Action action; std::string label; };

struct AppState {
    std::string search_query;

    std::vector<Video> results;
    int selected_result = 0;
    int results_scroll  = 0;

    std::vector<ActionItem> actions;
    int selected_action  = 0;
    bool actions_visible = false;

    Tab   active_tab = Tab::Feed;
    Panel focus      = Panel::Search;

    std::string status_message;
    bool running = true;

    int term_w = 0, term_h = 0;

    bool is_playing = false;
    bool is_paused  = false;
    std::string now_playing;
    PlayMode play_mode = PlayMode::Video;

    // Playback progress (updated from mpv IPC every render cycle)
    double playback_pos  = 0.0;   // seconds elapsed
    double playback_dur  = 0.0;   // total duration in seconds
    int    playback_vol  = 100;   // current volume %

    // Waveform/scrubber tap zone on the streamlined Now Playing screen, set by
    // TUI::stream_playing() each frame it draws one. Its Y position isn't
    // fixed like the transport row (it shifts with whether a thumbnail
    // rendered above it), so input.cpp reads these instead of re-deriving
    // the same layout math -- that math depends on thumbnail sizing, which
    // is involved enough that duplicating it is the more likely place to
    // drift out of sync, not less. -1 when no waveform is on screen this
    // frame (nothing playing, or the screen is too short to fit one).
    int waveform_y = -1, waveform_x = -1, waveform_w = 0;
    // A tap on the waveform stashes its target position here before setting
    // status_message = "__SEEK_TO__" -- same pattern as stream_timer_input
    // for __STREAM_SET_TIMER__, just a double instead of a string.
    double stream_seek_target = -1.0;

    bool thumbs_available = false;
    // Resolved thumbnail graphics protocol (cast of Thumbnails::Gfx). Set once
    // by App at startup. 0=None,1=Blocks,2=Sixel,3=Kitty,4=Iterm. Defaults to
    // Blocks so behaviour is unchanged unless a raster mode is selected.
    int gfx_mode = 1;

    bool show_shortcuts = false;   // ? key opens the shortcuts reference panel

    // In-app settings UI (Ctrl-S). Live theme switching + key rebinding,
    // no restart required. settings_tab: 0=Theme, 1=Accelerators.
    bool show_settings   = false;
    int  settings_tab    = 0;
    int  settings_sel    = 0;   // cursor within the active tab
    bool settings_capturing = false;  // true while waiting for a key to bind
    std::string settings_toast;       // transient confirmation line
    // Snapshot the App fills before rendering the settings UI, so the TUI
    // stays decoupled from Config. Theme names + current accelerator labels.
    std::vector<std::string> settings_theme_names;   // 18 theme names
    std::vector<std::string> settings_accel_labels;  // "Pause / resume" ...
    std::vector<std::string> settings_accel_keys;    // "Space", "^Q" ...
    Theme theme    = Theme::Default;
    bool grayscale = false;  // legacy compat
    ThemeColors resolved_colors;  // final colors after custom overrides — set by App

    bool logged_in = false;
    std::string auth_browser;

    std::vector<std::string> browser_choices;
    int browser_pick_idx = 0;

    int sort_col = 0;
    int sort_row = 0;

    int save_prompt_idx = 0;

    // ── Home panel (History/Feed/Library) navigation ─────────────────────────
    int home_selected_idx = 0;    // selected row in the active home tab
    std::string home_search_query; // title queued for search from home panel

    // ── Playlist state ───────────────────────────────────────────────────────
    int selected_playlist      = 0;  // index in playlists list
    int playlist_scroll        = 0;  // scroll offset in playlists list
    int playlist_video_idx     = 0;  // selected video inside current playlist
    int playlist_video_scroll  = 0;  // scroll offset inside playlist view
    std::string current_playlist_id;  // id of playlist being viewed

    // Playlist picker popup
    std::vector<std::string> playlist_names;  // "Create new…" + existing names
    int playlist_pick_idx = 0;
    std::string new_playlist_name;  // being typed in NewPlaylist dialog

    // ── Streamlined mode (auto-engaged on very narrow terminals) ─────────────
    int   ui_mode        = 0;   // 0 = normal, 1 = streamlined (resolved per frame)
    int   stream_screen  = 0;   // cast of StreamScreen
    int   stream_menu_sel = 0;  // selected row in the iPod-style menu
    int   stream_action_sel = 0;// 0 = Play video, 1 = Play audio
    std::string stream_section; // current Browse section label (header + empty text)
    bool  stream_on_playlists = false;  // Browse is showing playlist names
    Video stream_now;           // track shown on the now-playing screen

    // ── Phone / sleep mode (--sleep-timer, --audio-only) ─────────────────────
    // force_audio_only forces every play action to audio (no mpv video
    // window, which matters most on Termux where there's usually nowhere
    // for one to appear). sleep_timer_active / _remaining_sec are refreshed
    // by App::run() each frame purely for display; App owns the real
    // deadline and stops playback + exits when it elapses.
    bool  force_audio_only        = false;
    bool  sleep_timer_active      = false;
    int   sleep_timer_remaining_sec = 0;

    // ── Mobile-native sub-dialogs (MiniMenu / PlaylistPick / NewPlaylistName /
    // TimerInput) -- all reachable only by touch or the header ‹Back/Menu≡
    // taps, no Ctrl combos, no screen requires a key that isn't already
    // on-screen or typed. stream_nav_stack records where ‹Back returns to;
    // push the current screen before navigating into any of these four, pop
    // on back. Needed because these can nest (Browse -> MiniMenu ->
    // PlaylistPick -> NewPlaylistName) -- a single "previous screen" slot
    // can't unwind more than one level correctly.
    std::vector<int> stream_nav_stack;
    int   stream_minimenu_sel  = 0;
    std::string stream_timer_input;    // typed "1h30m" / "45m" / "90" etc.
};

// The streamlined section menu, shared by the renderer and input handler so the
// selected index always maps to the same action. Mirrors the normal-mode tabs,
// plus Search; "Now Playing" only appears while something is playing.
inline std::vector<std::string> stream_menu_items(const AppState& s) {
    std::vector<std::string> v = {"Search", "Library", "Playlists", "Feed", "History"};
    if (s.is_playing) v.push_back("Now Playing");
    return v;
}

// The mini action menu (Save / Add to Playlist / Sleep Timer), opened via
// the header Menu≡ tap from Browse (a result selected) or Playing. Save and
// Add to Playlist only apply when there's an actual video in view.
inline bool stream_minimenu_has_video(const AppState& s) {
    if (s.stream_nav_stack.empty()) return false;
    int parent = s.stream_nav_stack.back();
    if (parent == (int)StreamScreen::Browse)
        return !s.stream_on_playlists && !s.results.empty() &&
               s.selected_result < (int)s.results.size();
    if (parent == (int)StreamScreen::Playing)
        return !s.stream_now.id.empty();
    return false;
}
inline std::vector<std::string> stream_minimenu_items(const AppState& s) {
    std::vector<std::string> v;
    if (stream_minimenu_has_video(s)) {
        v.push_back("Save to Library");
        v.push_back("Add to Playlist");
    }
    v.push_back("Sleep Timer...");
    return v;
}

namespace Color {
    constexpr int BG         = 1;
    constexpr int SEARCH_BOX = 2;
    constexpr int TITLE      = 3;
    constexpr int CHANNEL    = 4;
    constexpr int STATS      = 5;
    constexpr int SELECTED   = 6;
    constexpr int ACTION     = 7;
    constexpr int ACTION_SEL = 8;
    constexpr int STATUS     = 9;
    constexpr int BORDER     = 10;
    constexpr int HEADER     = 11;
    constexpr int ACCENT     = 12;
    constexpr int TAG        = 13;
    constexpr int PUBLISHED  = 14;
    constexpr int BOOKMARK   = 15;
    constexpr int DESC       = 16;
    constexpr int SELECTED_BAR = 17;  // full-width selection bar (fg on bg)
}

} // namespace ytui

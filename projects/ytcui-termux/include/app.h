#pragma once
#include "types.h"
#include "tui.h"
#include "youtube.h"
#include "player.h"
#include "input.h"
#include "config.h"
#include "library.h"
#include "theme.h"
#include <chrono>

namespace ytui {

class App {
public:
    App(Theme theme);
    ~App();
    int run();
    void force_cleanup();
    void set_player_options(const PlayerOptions& opts);
    // Override the thumbnail graphics mode from the CLI (--gfx). Re-resolves
    // against the terminal. Empty string leaves the config value in place.
    void set_graphics_mode(const std::string& mode);
    void set_ui_mode(const std::string& mode);
    // Phone / sleep mode. minutes <= 0 disables the timer (audio_only can
    // still be set on its own). Forces streamlined UI + audio-only playback.
    // The wake lock itself is unconditional per-session (see run()), not
    // tied to whether a timer is armed. Call before run().
    void set_sleep_options(int minutes, bool audio_only);

private:
    AppState state_;
    TUI      tui_;
    YouTube  youtube_;
    Player   player_;
    InputHandler input_;
    Config   config_;
    Library  library_;

    // Sleep timer: sleep_active_ is only true while a timer is armed and
    // still running. sleep_deadline_ is meaningless otherwise.
    bool sleep_active_ = false;
    std::chrono::steady_clock::time_point sleep_deadline_;
    // Independent of sleep_active_: held for the whole session (see run()),
    // not just while a timer is counting down, so backgrounding Termux
    // without a timer set still survives.
    bool wake_lock_held_ = false;
    // Whether TUI currently has SGR mouse click-reporting turned on. Starts
    // true (matches TUI::init()); toggled off while the streamlined Search
    // screen is active so a tap is a plain touch again, not a swallowed
    // click -- see TUI::set_mouse_capture().
    bool mouse_capture_on_ = true;
    // Clock-based elapsed-time fallback for when mpv's IPC doesn't report
    // time-pos (piped/muxed YouTube streams). Reset on each new play start.
    std::chrono::steady_clock::time_point playback_clock_base_;
    double playback_clock_offset_ = 0.0;

    void build_actions();
    void build_playlist_actions();
    void do_search();
    void execute_action(Action action);
    void execute_playlist_action(Action action);
    void open_in_browser(const std::string& url);
    void copy_to_clipboard(const std::string& text);
    void prefetch_thumbnails();
    void resolve_graphics();
    // Force-disable features the terminal can't actually do (colour, chafa,
    // sixel/kitty/iterm), unless config.force_features overrides. Pass
    // authoritative=true once ncurses has reported the real colour count.
    void apply_capability_overrides(bool authoritative);
    void show_browser_picker();
    void show_playlist_picker();
    void enter_playlist(const std::string& playlist_id);
    void refresh_playlist_names();
    void apply_sort_filter();
    void do_save(int choice);

    // In-app settings UI (Ctrl-S): live theme switching + accelerator rebinding.
    void handle_settings_key(int ch);
    void apply_theme_live(const std::string& theme_name);  // re-theme, no restart
};

} // namespace ytui

#!/bin/sh
# ois/hooks/post-install.sh -- Termux only.
#
# ytcui is a music player controlled by taps and the transport row; the
# physical volume rocker should move actual playback loudness, not whatever
# Termux's own key-remapping (Ctrl/arrow shortcuts on long-press) turns it
# into. By default Termux ships with volume-keys unset, which the app
# resolves to its own "virtual" behaviour rather than real system volume
# (confirmed against termux-app's own TermuxPropertyConstants.java --
# DEFAULT_IVALUE_VOLUME_KEYS_BEHAVIOUR is "virtual", and "volume" is the
# value that hands the keys back to Android as ordinary volume control).
#
# Never overwrites an existing termux.properties -- only appends the one
# line this app needs, and only if volume-keys isn't already set to
# *something* (respecting a user who deliberately chose "virtual").

[ -n "${TERMUX_VERSION:-}" ] || exit 0

TP_DIR="$HOME/.termux"
TP_FILE="$TP_DIR/termux.properties"

mkdir -p "$TP_DIR" 2>/dev/null || { echo "post-install: couldn't create $TP_DIR, skipping volume-keys setup"; exit 0; }

if [ -f "$TP_FILE" ]; then
    if grep -qE '^[[:space:]]*volume-keys[[:space:]]*=' "$TP_FILE" 2>/dev/null; then
        echo "post-install: termux.properties already sets volume-keys, leaving it alone"
    else
        printf '\n# added by ytcui-termux: physical volume rocker controls real playback volume\nvolume-keys = volume\n' >> "$TP_FILE"
        echo "post-install: appended volume-keys = volume to existing termux.properties"
    fi
else
    printf '# added by ytcui-termux: physical volume rocker controls real playback volume\nvolume-keys = volume\n' > "$TP_FILE"
    echo "post-install: created termux.properties with volume-keys = volume"
fi

if command -v termux-reload-settings >/dev/null 2>&1; then
    termux-reload-settings
    echo "post-install: reloaded Termux settings"
else
    echo "post-install: termux-reload-settings not found -- restart Termux (or long-press, Reload Settings) for the volume-keys change to take effect"
fi

exit 0

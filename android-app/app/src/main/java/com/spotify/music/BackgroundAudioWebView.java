package com.spotify.music;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.webkit.WebView;

/**
 * Custom WebView that prevents Chromium from suspending WebAudio/HTML5/Iframe audio
 * playback when the app is minimized, screen is locked, or window loses focus.
 */
public class BackgroundAudioWebView extends WebView {

    public BackgroundAudioWebView(Context context) {
        super(context);
    }

    public BackgroundAudioWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public BackgroundAudioWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @Override
    protected void onWindowVisibilityChanged(int visibility) {
        // ALWAYS inform Chromium engine that window is VISIBLE so audio thread is never paused
        super.onWindowVisibilityChanged(View.VISIBLE);
    }

    @Override
    public void onWindowFocusChanged(boolean hasWindowFocus) {
        // Keep focus true so YouTube iframe never receives blur/suspend signal
        super.onWindowFocusChanged(true);
    }

    @Override
    protected void onVisibilityChanged(View changedView, int visibility) {
        super.onVisibilityChanged(changedView, View.VISIBLE);
    }
}

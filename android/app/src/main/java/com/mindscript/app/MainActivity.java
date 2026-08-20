package com.mindscript.app;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ObjectAnimator;
import android.os.Bundle;
import android.view.View;
import android.view.animation.AccelerateInterpolator;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        // Fade the icon into the already-rendered WebView content instead of the system's abrupt default exit.
        splashScreen.setOnExitAnimationListener(splashScreenView -> {
            View iconView = splashScreenView.getIconView();
            ObjectAnimator fadeOut = ObjectAnimator.ofFloat(iconView, View.ALPHA, 1f, 0f);
            fadeOut.setDuration(220);
            fadeOut.setInterpolator(new AccelerateInterpolator());
            fadeOut.addListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    splashScreenView.remove();
                }
            });
            fadeOut.start();
        });
    }
}

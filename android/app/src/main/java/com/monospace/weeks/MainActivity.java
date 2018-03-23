package com.monospace.weeks;

import android.os.Bundle;

import com.facebook.soloader.SoLoader;
import com.reactlibrary.RNReactNativeHapticFeedbackPackage;
import com.facebook.react.ReactActivity;
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;
import android.content.Intent;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "weeks";
    }

    public RNReactNativeHapticFeedbackPackage getPackages() {
        return new RNReactNativeHapticFeedbackPackage();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Fabric.with(this, new Crashlytics());
        SoLoader.init(this, false);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
}
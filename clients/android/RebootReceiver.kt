package com.android.system.config

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class RebootReceiver: BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {
            val serviceIntent = Intent(context, ForegroundService::class.java)
            context?.startService(serviceIntent)
        }
    }
}

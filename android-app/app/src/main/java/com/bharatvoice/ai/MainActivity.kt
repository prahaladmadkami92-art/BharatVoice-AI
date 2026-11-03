package com.bharatvoice.ai

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.widget.EditText

class MainActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        layout.gravity = Gravity.CENTER
        layout.setPadding(32, 32, 32, 32)
        layout.setBackgroundColor(Color.rgb(15, 23, 42))

        val title = TextView(this)
        title.text = "🇮🇳 BharatVoice AI"
        title.textSize = 28f
        title.setTextColor(Color.WHITE)
        title.gravity = Gravity.CENTER

        val subtitle = TextView(this)
        subtitle.text = "Aapka apna Indian AI Assistant"
        subtitle.textSize = 16f
        subtitle.setTextColor(Color.LTGRAY)
        subtitle.gravity = Gravity.CENTER

        val input = EditText(this)
        input.hint = "Yahan apna message likhein..."
        input.setTextColor(Color.WHITE)
        input.setHintTextColor(Color.LTGRAY)

        val send = Button(this)
        send.text = "Send Message"

        val status = TextView(this)
        status.text = "BharatVoice AI Ready"
        status.setTextColor(Color.GREEN)
        status.textSize = 16f

        layout.addView(title)
        layout.addView(subtitle)
        layout.addView(input)
        layout.addView(send)
        layout.addView(status)

        setContentView(layout)
    }
}

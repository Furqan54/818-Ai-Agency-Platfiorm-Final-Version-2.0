/* The sample call on the AI Receptionist page.
   The audio is site/assets/audio/voice-demo.mp3. Each line has the second it starts and ends, so the
   words appear as they are spoken. To use your own recording later, replace the mp3 and edit the numbers below. */
export const voiceDemo = {
  src: 'assets/audio/voice-demo.mp3',
  duration: 55.20,
  business: 'Marina Dental Clinic',
  lines: [
    { who: 'r', start: 0.35, end: 5.18, text: 'Good morning, and thank you for calling Marina Dental Clinic. How can I help you today?' },
    { who: 'c', start: 5.56, end: 9.02, text: "Hi, yes. I'd like to book a teeth cleaning, if possible." },
    { who: 'r', start: 9.52, end: 15.06, text: "Of course, sir, I'd be happy to help with that. Would you prefer a morning or an afternoon appointment?" },
    { who: 'c', start: 15.44, end: 17.82, text: 'Afternoon, please. Maybe tomorrow?' },
    { who: 'r', start: 18.32, end: 24.19, text: "Let me check the calendar. Tomorrow I have two o'clock, or four thirty. Which one works better for you?" },
    { who: 'c', start: 24.57, end: 26.16, text: 'Four thirty is perfect.' },
    { who: 'r', start: 26.66, end: 30.19, text: 'Wonderful. May I take your name and a mobile number for the booking?' },
    { who: 'c', start: 30.57, end: 37.31, text: "Sure. It's Omar Khalid, and my number is zero five zero, one two three, four five six seven." },
    { who: 'r', start: 37.81, end: 47.80, text: "Thank you, Mr. Khalid. You're booked for tomorrow at four thirty with Doctor Sara. I've just sent the confirmation to your WhatsApp. Is there anything else I can help you with?" },
    { who: 'c', start: 48.18, end: 50.23, text: "No, that's all. Thank you very much." },
    { who: 'r', start: 50.73, end: 54.82, text: 'My pleasure. We look forward to seeing you tomorrow. Have a wonderful day!' },
  ],
  /* height (8 to 100) of each of the 90 bars of the sound wave */
  peaks: [83, 84, 76, 79, 85, 41, 82, 74, 36, 93, 49, 86, 59, 69, 48, 59, 87, 79, 63, 32, 83, 93, 75, 76, 40, 82, 62, 63, 77, 45, 82, 54, 94, 91, 79, 64, 63, 92, 71, 35, 92, 72, 35, 77, 44, 93, 74, 84, 55, 34, 77, 79, 68, 81, 62, 61, 46, 68, 68, 59, 59, 74, 80, 65, 50, 93, 87, 78, 65, 47, 79, 83, 82, 73, 64, 100, 76, 49, 71, 79, 69, 58, 67, 69, 85, 84, 65, 73, 80, 28],
};

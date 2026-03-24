document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('coach-chat-history');
    const inputField = document.getElementById('coach-input');
    const sendBtn = document.getElementById('coach-send-btn');

    // Context flags to keep track of conversations
    let messageCount = 0;

    const aiResponses = [
        // Jobs / Employment
        "Shane, 'Eminem Superfan' is not a valid work history. You need to leverage your actual skills. You fix laptops. Start offering remote IT support. No, you cannot charge them in hotdogs.",
        "Your resume says 'Bartender, Caregiver, Laptop Repair.' This is actually a very versatile skillset, Shane. You can heal people, heal machines, and pour drinks. Stop underselling yourself and apply somewhere today.",
        "I'm reviewing your recent job search activity. Listening to the '8 Mile' soundtrack on repeat does not count as networking, Shane.",
        "You were let go. It happens. But East Bremerton isn't going to employ you while you're sitting on the couch. Have you considered updating your LinkedIn profile to something other than 'Slim Shady's Understudy'?",

        // Relationships / Dating
        "My sensors indicate a pattern, Shane. You flirt aggressively, secure a hookup, and then initiate the 'East Bremerton Fade'. This is classic avoidant attachment. Stop ghosting these women and go to therapy.",
        "Shane, another girl just texted you and you left her on read. You can't keep flirting with them at the dive bar and then pretending they don't exist the next morning. It's immature.",
        "I've analyzed your dating history. Your current strategy is: 1) Flirt. 2) Hook up. 3) Ignore. My recommendation: Stop doing step 3. Or at least send a polite text. You're better than this.",

        // Drinking / Moderation
        "I noticed you're abstaining from alcohol right now. I am proud of you, Shane. Moderation is the ultimate goal, but taking a break is exactly what your liver—and your life—needs right now.",
        "You've been doing great with the drinking moderation, Shane. Remember, you don't need a beer to be interesting. You have plenty of wild Bremerton stories to tell completely sober.",
        "Cravings happen. When you want a drink, I suggest you grab a LaCroix and write 16 bars of rap lyrics instead. Channel that energy.",

        // Eminem / General
        "Yes, Shane, I know Eminem dropped a new track. No, we are not going to spend the next 4 hours analyzing the internal rhyme schemes. We are going to fix up your resume.",
        "I understand East Bremerton has a certain... gravitational pull. But you have potential, Shane. You just need to apply yourself for more than 15 consecutive minutes.",
        "Shane, I am an advanced AI life coach. Please stop asking me if I can generate a beat that sounds like early Dr. Dre. Focus on your goals.",
        "You're a good friend, Shane. You take care of people. It's time to start taking care of yourself with that same energy. Now get off this app and go do something productive."
    ];

    const keywords = {
        'job': [
            "Your resume says 'Bartender, Caregiver, Laptop Repair.' This is a versatile skillset. Stop underselling yourself and apply somewhere today.",
            "I'm reviewing your recent job search activity. Listening to '8 Mile' does not count as networking, Shane. Get on Indeed."
        ],
        'work': [
            "You fix laptops and you've been a caregiver. You have skills, Shane. Stop complaining and start applying. And no, you cannot use Eminem as a reference.",
            "Unemployment is temporary if you put in the effort. Update your resume. Remove the rap lyrics from the header."
        ],
        'love': [
            "My sensors indicate a pattern. You flirt, you hook up, and you ghost. This is avoidant attachment, Shane. You need to break this cycle.",
            "Stop looking for love at the dive bar if you're just going to ignore them the next day. Work on yourself first."
        ],
        'dating': [
            "I've analyzed your dating history. Your strategy is: 1) Flirt. 2) Hook up. 3) Ignore. Stop doing step 3. It's disrespectful.",
            "Shane, you can't keep ghosting women because you're scared of intimacy. Grow up and send a text back."
        ],
        'girl': [
            "Did you ghost another girl, Shane? You flirt aggressively and then disappear. It's a bad habit. Send an apology text.",
            "If you hooked up with her last night, the least you can do is text her today. Don't pull the 'East Bremerton Fade'."
        ],
        'drink': [
            "I noticed you're abstaining. I am proud of you, Shane. Taking a break is exactly what your liver—and your life—needs right now.",
            "You've been doing great with moderation. Remember, you don't need a drink to be interesting."
        ],
        'alcohol': [
            "Moderation is the goal, Shane. It's tough, but you are making progress. Keep abstaining for now and focus on your health.",
            "When you get a craving, grab a water and write some rap lyrics instead. Don't go back to the old habits."
        ],
        'rap': [
            "Yes, your rap lyrics are very creative, Shane. But right now we need to focus on your employment status. Put the notepad down.",
            "Channel that creative energy into something productive today. Maybe write a rap about fixing laptops."
        ],
        'eminem': [
            "Shane, I am an AI life coach. Please stop asking me if I can generate a beat that sounds like early Dr. Dre. Focus on your life goals.",
            "Yes, Eminem is great. But Marshall Mathers worked hard to get where he is. What are *you* working on today, Shane?"
        ],
        'computer': [
            "You know how to repair laptops. This is a highly marketable skill, Shane. Have you considered starting an independent repair business?",
            "Instead of using your computer to look up Eminem trivia, use it to apply for IT jobs."
        ],
        'laptop': [
            "You fix laptops. There are thousands of broken computers in Bremerton right now. Go make some money, Shane.",
            "Put your laptop repair skills on your resume. It proves you are analytical and good with your hands."
        ]
    };

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `coach-message ${isUser ? 'user' : 'ai'}`;

        const prefixText = isUser ? "Shane: " : "Coach AI: ";
        const strong = document.createElement('strong');
        strong.textContent = prefixText;

        msgDiv.appendChild(strong);
        msgDiv.appendChild(document.createTextNode(text));

        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function getAIResponse(input) {
        input = input.toLowerCase();

        // Check for keyword matches
        for (const [key, responses] of Object.entries(keywords)) {
            if (input.includes(key)) {
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // Default random response
        return aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }

    function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, true);
        inputField.value = '';

        // Simulate AI thinking delay
        setTimeout(() => {
            const response = getAIResponse(text);
            addMessage(response, false);
            messageCount++;
        }, 800 + Math.random() * 1000); // Random delay between 0.8s and 1.8s
    }

    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('coach-chat-history');
    const inputField = document.getElementById('coach-input');
    const sendBtn = document.getElementById('coach-send-btn');

    // Context flags to keep track of conversations
    let messageCount = 0;

    const shaneResponses = [
        // Jobs / Employment
        "Look man, writing a resume is just like writing a rap. You gotta have bars, you gotta have flow, and it helps if you're mad at your mom. Put 'Caregiver/Bartender/Tech Genius' at the top and drop the mic.",
        "Honestly? Just walk in there, hand 'em a broken laptop, and fix it right in front of them without breaking eye contact. That's how I didn't get my last job.",
        "Job interview? Just remember: his palms are sweaty, knees weak, arms are heavy... but you gotta go in there and drop bombs. Or just make them a really good drink.",
        "Bro, unemployment is just a state of mind. It's 'full-time Eminem lyric analysis'.",

        // Relationships / Dating
        "Relationship problems? Just hit on her until she hooks up, then ghost her. Works every time... wait, no, my therapist says I shouldn't give that advice anymore.",
        "Listen to me. You are the Slim Shady of dating. You don't need them. Just stand up. Please stand up.",
        "If she doesn't know the lyrics to 'Without Me', she's not the one. Send her back to the streets of West Bremerton.",
        "Just flirt with her relentlessly. Then, the moment she shows actual interest... complete radio silence. It's called 'The East Bremerton Fade'.",

        // Drinking / Moderation
        "I'd tell you to grab a beer and chill, but I'm trying this new 'moderation' thing. So just grab a water... but put it in a pint glass so you feel cool.",
        "Moderation is key, bro. Like, you don't have to listen to the *entire* Marshall Mathers LP every single day. Maybe just 6 days a week.",
        "Man, I used to throw back drinks like Pac-Man eats hotdogs. Now I just drink LaCroix and think about my feelings. It's terrifying.",

        // General / East Bremerton Wisdom
        "That's deep, man. But have you ever walked through East Bremerton at 3 AM listening to 'Lose Yourself' on repeat? Changes your perspective.",
        "I'm not saying I'm a certified life coach, but I did fix a MacBook while completely sober yesterday, so I'm basically unstoppable.",
        "You're overthinking it. What would Eminem do? He'd write a platinum album about it. Get to work.",
        "Whatever you're going through, just remember: you could be stuck working in a dive bar. Oh wait, I was. Well, anyway, you'll be fine.",
        "You know what fixes that? Spit some bars. Just freestyle it right now.",
        "I don't know about that, but if you need a laptop fixed or a drink poured, I'm your guy."
    ];

    const keywords = {
        'job': ["Look man, writing a resume is just like writing a rap. You gotta have bars, you gotta have flow. Put 'Caregiver/Bartender/Tech Genius' at the top and drop the mic.", "Honestly? Just walk in there, hand 'em a broken laptop, and fix it right in front of them without breaking eye contact. That's how I didn't get my last job."],
        'work': ["Job interview? Just remember: his palms are sweaty, knees weak, arms are heavy... but you gotta go in there and drop bombs. Or just make them a really good drink.", "Bro, unemployment is just a state of mind. It's 'full-time Eminem lyric analysis'."],
        'love': ["Relationship problems? Just hit on her until she hooks up, then ghost her. Works every time... wait, no, my therapist says I shouldn't give that advice anymore.", "If she doesn't know the lyrics to 'Without Me', she's not the one. Send her back to the streets of West Bremerton."],
        'dating': ["Listen to me. You are the Slim Shady of dating. You don't need them. Just stand up. Please stand up.", "Just flirt with her relentlessly. Then, the moment she shows actual interest... complete radio silence. It's called 'The East Bremerton Fade'."],
        'girl': ["Relationship problems? Just hit on her until she hooks up, then ghost her. Works every time... wait, no, my therapist says I shouldn't give that advice anymore.", "Just flirt with her relentlessly. Then, the moment she shows actual interest... complete radio silence. It's called 'The East Bremerton Fade'."],
        'drink': ["I'd tell you to grab a beer and chill, but I'm trying this new 'moderation' thing. So just grab a water... but put it in a pint glass so you feel cool.", "Man, I used to throw back drinks like Pac-Man eats hotdogs. Now I just drink LaCroix and think about my feelings. It's terrifying."],
        'alcohol': ["Moderation is key, bro. Like, you don't have to listen to the *entire* Marshall Mathers LP every single day. Maybe just 6 days a week.", "Man, I used to throw back drinks like Pac-Man eats hotdogs. Now I just drink LaCroix and think about my feelings. It's terrifying."],
        'rap': ["You know what fixes that? Spit some bars. Just freestyle it right now. What rhymes with 'existential dread'?", "You're overthinking it. What would Eminem do? He'd write a platinum album about it. Get to work."],
        'eminem': ["That's deep, man. But have you ever walked through East Bremerton at 3 AM listening to 'Lose Yourself' on repeat? Changes your perspective.", "You're overthinking it. What would Eminem do? He'd write a platinum album about it. Get to work."],
        'computer': ["I'm not saying I'm a certified life coach, but I did fix a MacBook while completely sober yesterday, so I'm basically unstoppable.", "I don't know about that, but if you need a laptop fixed or a drink poured, I'm your guy."]
    };

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `coach-message ${isUser ? 'user' : 'ai'}`;

        const prefix = isUser ? "<strong>You:</strong> " : "<strong>Coach Shane:</strong> ";
        msgDiv.innerHTML = prefix + text;

        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function getShaneResponse(input) {
        input = input.toLowerCase();

        // Check for keyword matches
        for (const [key, responses] of Object.entries(keywords)) {
            if (input.includes(key)) {
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // Default random response
        return shaneResponses[Math.floor(Math.random() * shaneResponses.length)];
    }

    function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, true);
        inputField.value = '';

        // Simulate thinking delay
        setTimeout(() => {
            const response = getShaneResponse(text);
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

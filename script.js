// --- Core Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on based on the <title> tag text
    const titleText = document.body.parentElement.querySelector('title').textContent;
    
    // Initialize main app pages (home.html, login.html, report.html, etc.)
    if (titleText.includes('Home') || titleText.includes('Daily Log') || titleText.includes('Monthly Report') || titleText.includes('Meditation') || titleText.includes('About the Team')) {
        initMainAppPages();
    } else if (titleText.includes('Login') || titleText.includes('Register')) {
        initAuthPage();
    }
});

// --- Utility Functions ---

function getEntries() {
    const entries = localStorage.getItem('welltrack_entries');
    return entries ? JSON.parse(entries).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function filterEntriesByDays(entries, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days); 
    return entries.filter(entry => new Date(entry.date) > cutoffDate);
}

function displayAuthMessage(element, message, isError = true) {
    element.textContent = message;
    element.classList.remove('hidden');
    element.style.color = isError ? '#F44336' : 'var(--secondary-color)'; 
}

// --- Main Pages Logic (home.html, login.html, report.html, etc.) ---

function initMainAppPages() {
    const titleText = document.body.parentElement.querySelector('title').textContent;
    
    // Add Logout functionality to the button on all main pages
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => { 
            alert('Logged out successfully. Redirecting to Login.');
            // Redirects to the new login page (index.html)
            window.location.href = 'index.html'; 
        });
    }

    // Only run specific page logic if on the specific page
    if (titleText.includes('Daily Log')) {
        initDailyLogPage();
    } else if (titleText.includes('Monthly Report')) {
        initReportPage();
    }
}


// --- Auth Page Logic (index.html, register.html) ---

function initAuthPage() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const email = emailInput.value.trim();
    const messageElement = document.getElementById('auth-message');
    messageElement.classList.add('hidden');

    if (!email.includes('@')) {
        displayAuthMessage(messageElement, "Invalid email format. Must contain '@'.", true);
        return;
    }
    
    // Successful login action: Redirect to the new Daily Log page (login.html)
    displayAuthMessage(messageElement, `Login successful for ${email}! Redirecting to Daily Log.`, false);
    
    setTimeout(() => {
        window.location.href = 'login.html'; 
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('confirm-password');
    const messageElement = document.getElementById('auth-message');
    messageElement.classList.add('hidden');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!email.includes('@')) {
        displayAuthMessage(messageElement, "Invalid email format. Must contain '@'.", true);
        return;
    }

    if (password !== confirmPassword) {
        displayAuthMessage(messageElement, "Passwords do not match.", true);
        return;
    }

    // Successful registration action: Redirect to the new login page (index.html)
    displayAuthMessage(messageElement, `Registration successful for ${email}! Proceeding to login...`, false);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// --- Daily Log Page Logic (login.html) ---

function initDailyLogPage() {
    const form = document.getElementById('daily-log-form');
    const moodButtons = document.querySelectorAll('.mood-btn');
    const moodValueInput = document.getElementById('mood-value-input');
    const stressLevelInput = document.getElementById('stress-level');
    const stressValueSpan = document.getElementById('stress-value');
    const messageElement = document.getElementById('message');
    const dateInput = document.getElementById('entry-date');
    const notesInput = document.getElementById('daily-notes'); // Notes Input - ADDED BACK

    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            moodValueInput.value = button.getAttribute('data-value');
        });
    });

    stressLevelInput.addEventListener('input', () => {
        stressValueSpan.textContent = stressLevelInput.value;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!moodValueInput.value) {
            alert("Please select a mood before saving!");
            return;
        }

        const selectedDate = dateInput.value;
        let entries = getEntries();
        if (entries.some(entry => entry.date.split('T')[0] === selectedDate)) {
             alert(`An entry for ${formatDate(selectedDate)} already exists. Please choose a different date.`);
             return;
        }

        const newEntry = {
            date: selectedDate + 'T12:00:00.000Z', 
            mood: parseInt(moodValueInput.value),
            stress: parseInt(stressLevelInput.value),
            sleep: parseFloat(document.getElementById('sleep-duration').value),
            notes: notesInput.value.trim() // Notes field - ADDED BACK
        };

        entries.unshift(newEntry);
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('welltrack_entries', JSON.stringify(entries));

        messageElement.textContent = `Entry saved for ${formatDate(newEntry.date)}!`;
        messageElement.classList.remove('hidden');
        
        form.reset();
        dateInput.value = today; 
        moodButtons.forEach(btn => btn.classList.remove('selected'));
        moodValueInput.value = '';
        stressValueSpan.textContent = stressLevelInput.value;

        setTimeout(() => messageElement.classList.add('hidden'), 3000);
    });
}

// --- Monthly Report Page Logic (report.html) ---

function initReportPage() {
    const allEntries = getEntries();
    const last30Days = filterEntriesByDays(allEntries, 30); 

    if (last30Days.length < 7) { 
        document.querySelector('.report-summary .summary-grid').innerHTML = 
            '<p class="advisory-text">Insufficient data. Log at least 7 daily entries to generate a meaningful summary and personalized advice.</p>';
        document.getElementById('advisory-message').innerHTML = 
            '<p>Keep logging your daily entries for at least one week to unlock personalized advice!</p>';
        const chartSection = document.querySelector('.trend-chart-section');
        if (chartSection) chartSection.style.display = 'none'; 
        displayFullHistory([]);
        return;
    }

    displayMonthlySummary(last30Days);
    displayWellnessAdvisory(last30Days); 
    displaySevenDayChart(last30Days.slice(0, 7)); 
    displayFullHistory(allEntries.slice(0, 30)); 
    setupHistoryTableFilter(allEntries);
}

function setupHistoryTableFilter(allEntries) {
    const searchInput = document.getElementById('date-search-input');
    const clearButton = document.getElementById('clear-search-btn');
    const filterMessage = document.getElementById('filter-message');
    const maxDate = new Date().toISOString().split('T')[0];
    searchInput.max = maxDate;

    const filterTable = () => {
        const selectedDate = searchInput.value;
        let filteredEntries = allEntries;
        
        if (selectedDate) {
            filteredEntries = allEntries.filter(entry => 
                entry.date.split('T')[0] === selectedDate
            );
            
            if (filteredEntries.length > 0) {
                filterMessage.textContent = `Showing entry for ${formatDate(selectedDate)}.`;
                filterMessage.style.color = 'var(--secondary-color)';
            } else {
                filterMessage.textContent = `No entry found for ${formatDate(selectedDate)}.`;
                filterMessage.style.color = '#F44336';
            }
        } else {
            filteredEntries = allEntries.slice(0, 30);
            filterMessage.textContent = 'Showing all recent entries.';
            filterMessage.style.color = 'var(--light-text)';
        }

        displayFullHistory(filteredEntries);
    };

    searchInput.addEventListener('change', filterTable);
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterTable();
    });
}

function displayMonthlySummary(entries) {
    const totalStress = entries.reduce((sum, entry) => sum + entry.stress, 0);
    const totalSleep = entries.reduce((sum, entry) => sum + entry.sleep, 0);
    
    const avgStress = (totalStress / entries.length).toFixed(1);
    const avgSleep = (totalSleep / entries.length).toFixed(1);
    const maxStressEntry = entries.reduce((max, entry) => 
        entry.stress > max.stress ? entry : max
    );

    document.getElementById('avg-stress').textContent = avgStress;
    document.getElementById('avg-sleep').textContent = avgSleep;
    document.getElementById('highest-stress-date').textContent = `${formatDate(maxStressEntry.date)} (${maxStressEntry.stress}/5)`;
}

function displayWellnessAdvisory(entries) {
    const totalStress = entries.reduce((sum, entry) => sum + entry.stress, 0);
    const totalSleep = entries.reduce((sum, entry) => sum + entry.sleep, 0);
    const avgStress = (totalStress / entries.length).toFixed(1);
    const avgSleep = (totalSleep / entries.length).toFixed(1);
    
    let adviceTitle = '✅ Great Job! Stable Trends Detected.';
    let adviceDetail = 'Your average stress and sleep levels are within healthy ranges. Keep up your routine! Recommendation: Maintain consistency and use the Meditation tool as needed.';

    const STRESS_THRESHOLD = 3.5;
    const SLEEP_THRESHOLD = 6.5;

    if (avgStress >= STRESS_THRESHOLD && avgSleep < SLEEP_THRESHOLD) {
        adviceTitle = '🚨 High Risk: Elevated Stress and Low Sleep';
        adviceDetail = `Your average stress (${avgStress}/5) is high, and average sleep (${avgSleep} hrs) is low. This pattern indicates burnout risk.  <br>
        Action: Focus on wind-down routines and consider using the Meditation tool immediately.`;
    } else if (avgStress >= STRESS_THRESHOLD) {
        adviceTitle = '⚠️ Elevated Stress Detected';
        adviceDetail = `Your average stress (${avgStress}/5) is high. Identify recent triggers (workload, deadlines) and consciously schedule break time.  <br> 
        Action: Review your schedule and make time for physical activity or mindfulness.`;
    } else if (avgSleep < SLEEP_THRESHOLD) {
        adviceTitle = '⚠️ Low Sleep Quality Detected';
        adviceDetail = `Your average sleep (${avgSleep} hrs) is low. Lack of sleep impacts mood and health. <br>
        Action: Maintain a consistent sleep schedule, limit screen time before bed, and ensure a dark, cool sleeping environment.`;
    }
    
    document.getElementById('advisory-message').innerHTML = `<p><strong>${adviceTitle}</strong></p><p>${adviceDetail}</p>`;
    
}

function displaySevenDayChart(entries) {
    const chartContainer = document.getElementById('stress-bar-chart');
    if (!chartContainer) return; 
    chartContainer.innerHTML = ''; 

    // Use at most the last 7 entries for the 7-day chart
    const reversedEntries = [...entries].slice(0, 7).reverse(); 

    const MAX_STRESS = 5; 
    const MAX_SLEEP = 10; 

    reversedEntries.forEach(entry => {
        const dayWrapper = document.createElement('div');
        dayWrapper.className = 'day-wrapper';
        // Ensure width scales correctly based on the number of days displayed
        dayWrapper.style.width = `${100 / reversedEntries.length}%`; 
        dayWrapper.title = `On ${formatDate(entry.date)}:\nStress: ${entry.stress}/5\nSleep: ${entry.sleep} Hrs`;
        
        const barGroup = document.createElement('div');
        barGroup.className = 'bar-group';
        
        // Calculate heights: Stress is 1-5 (scaled to MAX_STRESS=5), Sleep is Hrs (scaled to MAX_SLEEP=10)
        const stressHeight = (entry.stress / MAX_STRESS) * 100;
        const stressBar = document.createElement('div');
        stressBar.className = 'chart-bar bar-stress';
        stressBar.style.height = `${stressHeight}%`; 
        stressBar.style.width = '45%';
        stressBar.title = `Stress: ${entry.stress}/5`;

        const sleepHeight = (entry.sleep / MAX_SLEEP) * 100; 
        const sleepBar = document.createElement('div');
        sleepBar.className = 'chart-bar bar-sleep';
        sleepBar.style.height = `${sleepHeight}%`; 
        sleepBar.style.width = '45%';
        sleepBar.title = `Sleep: ${entry.sleep} hrs`;

        barGroup.appendChild(stressBar);
        barGroup.appendChild(sleepBar);

        const label = document.createElement('span');
        label.textContent = formatDate(entry.date);

        dayWrapper.appendChild(barGroup);
        dayWrapper.appendChild(label);
        chartContainer.appendChild(dayWrapper);
    });
}

function displayFullHistory(entries) {
    const tableBody = document.querySelector('#data-history-table tbody');
    if (!tableBody) return;
    
    // Check if Notes column was accidentally inserted in the header (and remove it)
    const tableHead = document.querySelector('#data-history-table thead tr');
    // We expect exactly 4 columns now. If there are 5 (meaning 'Notes' is present), remove the last one.
    if (tableHead && tableHead.children.length === 5) {
        tableHead.removeChild(tableHead.lastElementChild);
    }

    tableBody.innerHTML = ''; 

    if (entries.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4; // Colspan set to 4 (Date, Mood, Stress, Sleep)
        cell.textContent = 'No entries found for the selected date or in recent history.';
        cell.style.textAlign = 'center';
        cell.style.fontStyle = 'italic';
        return;
    }
    
    entries.forEach(entry => { 
        const row = tableBody.insertRow();
        row.insertCell().textContent = formatDate(entry.date);
        
        let moodText;
        switch(entry.mood) {
            case 5: moodText = '😁 Excellent'; break;
            case 4: moodText = '😊 Good'; break;
            case 3: moodText = '😐 Neutral'; break;
            case 2: moodText = '😞 Low'; break;
            case 1: moodText = '😠 Stressed/Bad'; break;
            default: moodText = 'N/A';
        }
        row.insertCell().textContent = moodText;
        row.insertCell().textContent = `${entry.stress}/5`;
        row.insertCell().textContent = entry.sleep;
        // The Notes column cell is deliberately excluded here, as requested.
    });
}
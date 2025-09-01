document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('cardContainer');
    const newLessonButton = document.getElementById('newLessonButton');
    const progressBar = document.getElementById('progressBar');

    // ** QUAN TRỌNG: Thay thế URL này bằng đường link Google Sheet đã xuất bản của bạn **
    // Hướng dẫn: Mở Google Sheet -> File -> Share -> Publish to the web -> chọn định dạng .csv hoặc .tsv
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJOleoHDLk5zH9nw7HcBEuMVZtcO-6CE2df81BcfqjDEyCRzxZN-bFoIQc5tNCEbHu8y8z6Gxn9MwP/pub?gid=0&single=true&output=csv';

    let allQuestions = [];

    // Function to fetch and parse data from Google Sheet
    async function fetchData() {
        try {
            const response = await fetch(SHEET_URL);
            const text = await response.text();
            
            // Cập nhật hàm xử lý CSV để nó xử lý đúng dấu phẩy trong nội dung
            const rows = text.split('\n').slice(1);
            allQuestions = rows.map(row => {
                const parts = row.match(/(".*?"|[^",]+)(?=,|$)/g);
                if (!parts || parts.length < 2) {
                    return null; // Skip malformed rows
                }
                const question = parts[0].replace(/^"|"$/g, '');
                const answer = parts[1].replace(/^"|"$/g, '');
                return { question: question, answer: answer };
            }).filter(item => item !== null);

            // Display the first set of random questions after fetching data
            const questionsToShow = getRandomQuestions(12);
            displayQuestions(questionsToShow);

        } catch (error) {
            console.error('Error fetching data from Google Sheet:', error);
            cardContainer.innerHTML = '<p style="text-align: center; color: red;">Không thể tải dữ liệu. Vui lòng kiểm tra đường link Google Sheet của bạn.</p>';
        }
    }

    // Function to select 12 random questions from the master list
    function getRandomQuestions(num) {
        if (allQuestions.length === 0) {
            return [];
        }
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    // Function to create and display cards
    function displayQuestions(questionsToShow) {
        cardContainer.innerHTML = ''; // Clear previous questions
        questionsToShow.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('data-index', index); 
            card.innerHTML = `
                <h2>${item.question}</h2>
                <textarea placeholder="Write your answer here..." class="user-answer-textarea" id="user-answer-${index}"></textarea>
                <div class="answer" id="answer-${index}"></div>
                <button class="toggle-btn" data-target="answer-${index}">Check & Compare</button>
            `;
            cardContainer.appendChild(card);
        });
        setupEventListeners(questionsToShow);
    }

    // Function to set up event listeners for all dynamically created elements
    function setupEventListeners(questionsToShow) {
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        const cards = document.querySelectorAll('.card');

        // Intersection Observer for card animation
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        cards.forEach(card => {
            observer.observe(card);
        });

        // Toggle button functionality and typing effect
        toggleButtons.forEach((button, i) => {
            button.addEventListener('click', () => {
                const targetElement = document.getElementById(`answer-${i}`);
                const userAnswerTextarea = document.getElementById(`user-answer-${i}`);
                
                const currentQuestion = questionsToShow[i];

                if (targetElement.classList.contains('show')) {
                    targetElement.classList.remove('show');
                    userAnswerTextarea.style.display = 'block';
                    button.textContent = 'Check & Compare';
                } else {
                    targetElement.classList.add('show');
                    userAnswerTextarea.style.display = 'block';
                    button.textContent = 'Hide Answer';
                    targetElement.textContent = '';
                    typeWriterEffect(currentQuestion.answer, targetElement);
                }
            });
        });
    }

    // Typing Effect Function
    function typeWriterEffect(text, element, delay = 10) {
        let i = 0;
        element.textContent = ''; 
        const cursor = document.createElement('span');
        cursor.classList.add('typing-cursor');
        element.appendChild(cursor);
    
        function type() {
            if (i < text.length) {
                element.textContent = text.substring(0, i + 1);
                element.appendChild(cursor);
                i++;
                setTimeout(type, delay);
            } else {
                cursor.remove();
            }
        }
        type();
    }

    // Progress bar functionality
    window.addEventListener('scroll', () => {
        const docElem = document.documentElement;
        const scrollPx = docElem.scrollTop;
        const winHeightPx = docElem.scrollHeight - docElem.clientHeight;
        const scrolled = (scrollPx / winHeightPx) * 100;
        progressBar.style.width = scrolled + '%';
    });
    
    // New Lesson button functionality
    newLessonButton.addEventListener('click', () => {
        const questionsToShow = getRandomQuestions(12);
        displayQuestions(questionsToShow);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initial data fetch and display
    fetchData();
});
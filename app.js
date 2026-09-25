const app = {
    cards: JSON.parse(localStorage.getItem('flashcards')) || [],
    currentStudyIndex: 0,
    editingCardId: null,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.switchView('study');
    },

    cacheDOM() {
        this.dom = {
            viewStudy: document.getElementById('view-study'),
            viewManage: document.getElementById('view-manage'),
            btnGoStudy: document.getElementById('btn-go-study'),
            btnGoManage: document.getElementById('btn-go-manage'),
            studyEmpty: document.getElementById('study-empty-state'),
            studySession: document.getElementById('study-session'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            flashcard: document.getElementById('flashcard'),
            cardQuestion: document.getElementById('card-question'),
            cardAnswer: document.getElementById('card-answer'),
            studyControls: document.getElementById('study-controls'),
            btnMarkReview: document.getElementById('btn-mark-review'),
            btnMarkKnown: document.getElementById('btn-mark-known'),
            cardsList: document.getElementById('cards-list'),
            btnAddCard: document.getElementById('btn-add-card'),
            cardModal: document.getElementById('card-modal'),
            modalTitle: document.getElementById('modal-title'),
            inputQuestion: document.getElementById('input-question'),
            inputAnswer: document.getElementById('input-answer'),
            btnModalCancel: document.getElementById('btn-modal-cancel'),
            btnModalSave: document.getElementById('btn-modal-save')
        };
    },

    bindEvents() {
        this.dom.btnGoStudy.onclick = () => this.switchView('study');
        this.dom.btnGoManage.onclick = () => this.switchView('manage');
        
        this.dom.flashcard.onclick = () => {
            this.dom.flashcard.classList.toggle('flipped');
            this.dom.studyControls.classList.remove('hidden');
        };

        this.dom.btnMarkKnown.onclick = () => this.nextCard(true);
        this.dom.btnMarkReview.onclick = () => this.nextCard(false);

        this.dom.btnAddCard.onclick = () => this.openModal();
        this.dom.btnModalCancel.onclick = () => this.closeModal();
        this.dom.btnModalSave.onclick = () => this.saveCard();
    },

    switchView(view) {
        this.dom.viewStudy.classList.add('hidden');
        this.dom.viewManage.classList.add('hidden');
        this.dom.btnGoStudy.classList.remove('active');
        this.dom.btnGoManage.classList.remove('active');

        if (view === 'study') {
            this.dom.viewStudy.classList.remove('hidden');
            this.dom.btnGoStudy.classList.add('active');
            this.startStudySession();
        } else {
            this.dom.viewManage.classList.remove('hidden');
            this.dom.btnGoManage.classList.add('active');
            this.renderManageList();
        }
    },

    // Study Logic
    startStudySession() {
        if (this.cards.length === 0) {
            this.dom.studyEmpty.classList.remove('hidden');
            this.dom.studySession.classList.add('hidden');
            return;
        }

        this.dom.studyEmpty.classList.add('hidden');
        this.dom.studySession.classList.remove('hidden');
        this.currentStudyIndex = 0;
        this.updateStudyCard();
    },

    updateStudyCard() {
        const card = this.cards[this.currentStudyIndex];
        this.dom.cardQuestion.textContent = card.question;
        this.dom.cardAnswer.textContent = card.answer;
        this.dom.flashcard.classList.remove('flipped');
        this.dom.studyControls.classList.add('hidden');

        const progress = ((this.currentStudyIndex) / this.cards.length) * 100;
        this.dom.progressBar.style.width = `${progress}%`;
        this.dom.progressText.textContent = `${this.currentStudyIndex + 1} / ${this.cards.length}`;
    },

    nextCard(known) {
        // In a real app, we'd track 'known' status in localStorage
        this.currentStudyIndex++;
        if (this.currentStudyIndex >= this.cards.length) {
            alert("Session Complete! Great job.");
            this.currentStudyIndex = 0;
        }
        this.updateStudyCard();
    },

    // Manage Logic
    renderManageList() {
        this.dom.cardsList.innerHTML = '';
        this.cards.forEach((card, index) => {
            const item = document.createElement('div');
            item.className = 'card-item';
            item.innerHTML = `
                <div class="card-item-info">
                    <p>${card.question}</p>
                    <small>${card.answer.substring(0, 30)}${card.answer.length > 30 ? '...' : ''}</small>
                </div>
                <div class="item-actions">
                    <button class="btn-secondary edit-btn" data-index="${index}">Edit</button>
                    <button class="btn-delete delete-btn" data-index="${index}">Delete</button>
                </div>
            `;

            item.querySelector('.edit-btn').onclick = () => this.openModal(index);
            item.querySelector('.delete-btn').onclick = () => this.deleteCard(index);
            this.dom.cardsList.appendChild(item);
        });
    },

    openModal(index = null) {
        this.editingCardId = index;
        this.dom.cardModal.classList.remove('hidden');
        if (index !== null) {
            const card = this.cards[index];
            this.dom.modalTitle.textContent = "Edit Card";
            this.dom.inputQuestion.value = card.question;
            this.dom.inputAnswer.value = card.answer;
        } else {
            this.dom.modalTitle.textContent = "Add Card";
            this.dom.inputQuestion.value = '';
            this.dom.inputAnswer.value = '';
        }
    },

    closeModal() {
        this.dom.cardModal.classList.add('hidden');
        this.editingCardId = null;
    },

    saveCard() {
        const q = this.dom.inputQuestion.value.trim();
        const a = this.dom.inputAnswer.value.trim();

        if (!q || !a) return alert("Please fill in both fields");

        if (this.editingCardId !== null) {
            this.cards[this.editingCardId] = { question: q, answer: a };
        } else {
            this.cards.push({ question: q, answer: a });
        }

        this.persist();
        this.closeModal();
        this.renderManageList();
    },

    deleteCard(index) {
        if (confirm("Delete this card?")) {
            this.cards.splice(index, 1);
            this.persist();
            this.renderManageList();
        }
    },

    persist() {
        localStorage.setItem('flashcards', JSON.stringify(this.cards));
    }
};

app.init();
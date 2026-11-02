const DEBTS_KEY = 'debts_data_v2';
const DEPOSITS_KEY = 'deposits_data_v1';

class FinanceAppBrag {
    constructor() {
        this.debts = this.loadData(DEBTS_KEY);
        this.deposits = this.loadData(DEPOSITS_KEY);
        this.debtFilter = '';

        this.initTabs();
        this.initDebts();
        this.initDeposits();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('d-date').value = today;
        document.getElementById('dep-open').value = today;
        
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        document.getElementById('dep-close').value = nextYear.toISOString().split('T')[0];
    }

    loadData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', { 
            style: 'decimal', 
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount) + ' ₽';
    }

    formatDate(dateString) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options).toLowerCase();
    }

    initTabs() {
        const tabDebts = document.getElementById('tab-debts');
        const tabDeposits = document.getElementById('tab-deposits');
        const secDebts = document.getElementById('debts-section');
        const secDeposits = document.getElementById('deposits-section');

        tabDebts.addEventListener('click', () => {
            tabDebts.classList.add('active');
            tabDeposits.classList.remove('active');
            secDebts.classList.add('active');
            secDeposits.classList.remove('active');
        });

        tabDeposits.addEventListener('click', () => {
            tabDeposits.classList.add('active');
            tabDebts.classList.remove('active');
            secDeposits.classList.add('active');
            secDebts.classList.remove('active');
        });
    }

    initDebts() {
        const filterInput = document.getElementById('debt-filter');
        const clearBtn = document.getElementById('debt-filter-clear');

        filterInput.addEventListener('input', (e) => {
            this.debtFilter = e.target.value;
            if (this.debtFilter.trim()) {
                clearBtn.style.display = 'block';
            } else {
                clearBtn.style.display = 'none';
            }
            this.renderDebts();
        });

        clearBtn.addEventListener('click', () => {
            filterInput.value = '';
            this.debtFilter = '';
            clearBtn.style.display = 'none';
            filterInput.focus();
            this.renderDebts();
        });

        this.renderDebts();
        document.getElementById('form-debt').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDebt();
        });
    }

    setDebtorFilter(name) {
        const filterInput = document.getElementById('debt-filter');
        const clearBtn = document.getElementById('debt-filter-clear');
        if (this.debtFilter.trim().toLowerCase() === name.trim().toLowerCase()) {
            this.debtFilter = '';
            filterInput.value = '';
            clearBtn.style.display = 'none';
        } else {
            this.debtFilter = name;
            filterInput.value = name;
            if (name.trim()) {
                clearBtn.style.display = 'block';
            } else {
                clearBtn.style.display = 'none';
            }
        }
        this.renderDebts();
    }

    addDebt() {
        const nameInput = document.getElementById('d-name');
        const amountInput = document.getElementById('d-amount');
        const typeInput = document.getElementById('d-type');
        const dateInput = document.getElementById('d-date');

        const newDebt = {
            id: Date.now().toString(),
            name: nameInput.value.trim(),
            amount: parseFloat(amountInput.value),
            type: typeInput.value === 'in' ? 'they_owe' : 'i_owe',
            date: dateInput.value,
            status: 'active'
        };

        this.debts.unshift(newDebt);
        this.saveData(DEBTS_KEY, this.debts);
        
        nameInput.value = '';
        amountInput.value = '';
        nameInput.focus();
        
        this.renderDebts();
    }

    deleteDebt(id) {
        if (confirm('permanently delete this record?')) {
            this.debts = this.debts.filter(d => d.id !== id);
            this.saveData(DEBTS_KEY, this.debts);
            this.renderDebts();
        }
    }

    toggleDebtStatus(id) {
        const debt = this.debts.find(d => d.id === id);
        if (debt) {
            debt.status = debt.status === 'active' ? 'paid' : 'active';
            this.saveData(DEBTS_KEY, this.debts);
            this.renderDebts();
        }
    }

    renderDebts() {
        const list = document.getElementById('debts-list');
        list.innerHTML = '';

        const chipsContainer = document.getElementById('debtor-chips');
        const debtorSummary = document.getElementById('debtor-summary');
        const dsName = document.getElementById('ds-name');
        const dsIn = document.getElementById('ds-in');
        const dsOut = document.getElementById('ds-out');
        const dsBalance = document.getElementById('ds-balance');
        const listHeader = document.getElementById('debts-list-header');

        // Render chips for unique debtors
        const uniqueDebtors = [...new Set(this.debts.map(d => d.name.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'));
        
        if (uniqueDebtors.length > 0) {
            chipsContainer.style.display = 'flex';
            const isAllActive = !this.debtFilter.trim();
            let chipsHtml = `
                <button type="button" onclick="app.setDebtorFilter('')" 
                    style="border: 1px solid var(--light-rule); background: ${isAllActive ? 'var(--hero-ink)' : 'var(--light-bg-elev)'}; color: ${isAllActive ? 'var(--light-bg-elev)' : 'var(--hero-ink-soft)'}; padding: 4px 10px; border-radius: var(--radius-sm); cursor: pointer; white-space: nowrap; font-family: inherit;">
                    all (${this.debts.length})
                </button>
            `;
            uniqueDebtors.forEach(name => {
                const isSelected = this.debtFilter.trim().toLowerCase() === name.toLowerCase();
                const safeName = name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const count = this.debts.filter(d => d.name.trim().toLowerCase() === name.toLowerCase()).length;
                chipsHtml += `
                    <button type="button" onclick="app.setDebtorFilter('${safeName}')" 
                        style="border: 1px solid var(--light-rule); background: ${isSelected ? 'var(--hero-ink)' : 'var(--light-bg-elev)'}; color: ${isSelected ? 'var(--light-bg-elev)' : 'var(--hero-ink-soft)'}; padding: 4px 10px; border-radius: var(--radius-sm); cursor: pointer; white-space: nowrap; font-family: inherit;">
                        ${name} (${count})
                    </button>
                `;
            });
            chipsContainer.innerHTML = chipsHtml;
        } else {
            chipsContainer.innerHTML = '';
            chipsContainer.style.display = 'none';
        }

        const query = this.debtFilter.trim().toLowerCase();
        const isFiltered = query.length > 0;

        // Overall totals
        let totalIn = 0;
        let totalOut = 0;
        this.debts.forEach(debt => {
            if (debt.status === 'active') {
                if (debt.type === 'they_owe') totalIn += debt.amount;
                else totalOut += debt.amount;
            }
        });

        // Filtered records
        const filtered = isFiltered
            ? this.debts.filter(d => d.name.toLowerCase().includes(query))
            : this.debts;

        let filteredIn = 0;
        let filteredOut = 0;

        filtered.forEach(debt => {
            if (debt.status === 'active') {
                if (debt.type === 'they_owe') filteredIn += debt.amount;
                else filteredOut += debt.amount;
            }
        });

        const netBalance = filteredIn - filteredOut;

        if (isFiltered) {
            debtorSummary.style.display = 'block';
            listHeader.textContent = `active records (matched: ${filtered.length})`;

            document.getElementById('debts-in').textContent = this.formatCurrency(filteredIn);
            document.getElementById('debts-out').textContent = this.formatCurrency(filteredOut);

            const matchedDebtors = [...new Set(filtered.map(d => d.name.trim()))];
            dsName.textContent = matchedDebtors.length === 1 ? matchedDebtors[0] : `query: "${this.debtFilter.trim()}"`;
            dsIn.textContent = this.formatCurrency(filteredIn);
            dsOut.textContent = this.formatCurrency(filteredOut);
            
            if (netBalance > 0) {
                dsBalance.textContent = `+${this.formatCurrency(netBalance)} (inbound)`;
                dsBalance.style.color = 'var(--hero-bg)';
            } else if (netBalance < 0) {
                dsBalance.textContent = `-${this.formatCurrency(Math.abs(netBalance))} (outbound)`;
                dsBalance.style.color = 'var(--hero-ink-soft)';
            } else {
                dsBalance.textContent = '0 ₽';
                dsBalance.style.color = 'var(--dark-ink)';
            }
        } else {
            debtorSummary.style.display = 'none';
            listHeader.textContent = 'active records';

            document.getElementById('debts-in').textContent = this.formatCurrency(totalIn);
            document.getElementById('debts-out').textContent = this.formatCurrency(totalOut);
        }

        const sorted = [...filtered].sort((a, b) => {
            if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
            return new Date(b.date) - new Date(a.date);
        });

        sorted.forEach(debt => {
            const isPaid = debt.status === 'paid';
            const isIn = debt.type === 'they_owe';
            const safeName = debt.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            const li = document.createElement('li');
            li.className = `item ${isPaid ? 'closed' : ''}`;
            
            li.innerHTML = `
                <div>
                    <div class="item-title" style="cursor: pointer; text-decoration: underline;" onclick="app.setDebtorFilter('${safeName}')" title="filter by ${safeName}">${debt.name}</div>
                    <div class="item-meta">${this.formatDate(debt.date)} · ${isIn ? 'they owe' : 'i owe'}</div>
                </div>
                <div>
                    <div class="item-amount" style="color: ${isIn ? 'var(--hero-bg)' : 'var(--dark-ink)'}">${isIn ? '+' : '-'}${this.formatCurrency(debt.amount)}</div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="app.toggleDebtStatus('${debt.id}')">[ ${isPaid ? 'reopen' : 'resolve'} ]</button>
                        <button class="action-btn" onclick="app.deleteDebt('${debt.id}')">[ rm ]</button>
                    </div>
                </div>
            `;
            list.appendChild(li);
        });

        if (sorted.length === 0) {
            if (isFiltered) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div>no records matching "${this.debtFilter}"</div>
                        <button onclick="app.setDebtorFilter('')" class="action-btn" style="margin-top: 12px; color: var(--hero-bg);">[ reset filter ]</button>
                    </div>`;
            } else {
                list.innerHTML = `<div class="empty-state">No records found.</div>`;
            }
        }
    }

    initDeposits() {
        this.renderDeposits();
        document.getElementById('form-deposit').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDeposit();
        });
    }

    addDeposit() {
        const bankInput = document.getElementById('dep-bank');
        const amountInput = document.getElementById('dep-amount');
        const dateOpenInput = document.getElementById('dep-open');
        const dateCloseInput = document.getElementById('dep-close');

        const newDeposit = {
            id: Date.now().toString(),
            bank: bankInput.value.trim(),
            amount: parseFloat(amountInput.value),
            dateOpen: dateOpenInput.value,
            dateClose: dateCloseInput.value,
            status: 'active'
        };

        this.deposits.unshift(newDeposit);
        this.saveData(DEPOSITS_KEY, this.deposits);
        
        bankInput.value = '';
        amountInput.value = '';
        bankInput.focus();
        
        this.renderDeposits();
    }

    deleteDeposit(id) {
        if (confirm('permanently delete this asset?')) {
            this.deposits = this.deposits.filter(d => d.id !== id);
            this.saveData(DEPOSITS_KEY, this.deposits);
            this.renderDeposits();
        }
    }

    toggleDepositStatus(id) {
        const dep = this.deposits.find(d => d.id === id);
        if (dep) {
            dep.status = dep.status === 'active' ? 'closed' : 'active';
            this.saveData(DEPOSITS_KEY, this.deposits);
            this.renderDeposits();
        }
    }

    renderDeposits() {
        const list = document.getElementById('deposits-list');
        list.innerHTML = '';

        let totalDeposits = 0;

        const sorted = [...this.deposits].sort((a, b) => {
            if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
            return new Date(a.dateClose) - new Date(b.dateClose);
        });

        sorted.forEach(dep => {
            if (dep.status === 'active') {
                totalDeposits += dep.amount;
            }

            const isClosed = dep.status === 'closed';
            
            const li = document.createElement('li');
            li.className = `item ${isClosed ? 'closed' : ''}`;
            
            li.innerHTML = `
                <div>
                    <div class="item-title">${dep.bank}</div>
                    <div class="item-meta">${this.formatDate(dep.dateOpen)} &rarr; ${this.formatDate(dep.dateClose)}</div>
                </div>
                <div>
                    <div class="item-amount" style="color: var(--hero-bg);">${this.formatCurrency(dep.amount)}</div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="app.toggleDepositStatus('${dep.id}')">[ ${isClosed ? 'reopen' : 'close'} ]</button>
                        <button class="action-btn" onclick="app.deleteDeposit('${dep.id}')">[ rm ]</button>
                    </div>
                </div>
            `;
            list.appendChild(li);
        });

        document.getElementById('deposits-total').textContent = this.formatCurrency(totalDeposits);

        if (sorted.length === 0) {
            list.innerHTML = `<div class="empty-state">No assets found.</div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceAppBrag();
});

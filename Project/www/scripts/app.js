//Guilherme Ramos 202200083 202200083@estudantes.ips.pt  JoaoFelicio 202200033 202200033@estudantes.ips.pt

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    EventType.fetchEventTypes();
    Event.fetchEvents();
    Member.fetchMembers();
});

/**
 * Classe que representa um Membro e permite a gestão de membros num sistema.
 * Inclui funcionalidades para listar, criar, editar e apagar membros,
 * bem como gerir a sua inscrição em eventos.
 */
class Member {
    static list = [];
    static selectedIndex = null;

    /**
     * Obtém a lista de membros do servidor e atualiza a lista local.
     * @async
     */
    static async fetchMembers() {
        try {
            const response = await fetch("http://localhost:8081/members");
            const members = await response.json();
            this.list = members.map(member => ({
                id: member.id,
                name: member.name,
                preferredTypes: member.preferred_types ? member.preferred_types.split(",") : [],
                enrolledEvents: member.enrolled_events ? member.enrolled_events.split(",") : []
            }));
            this.render();
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    }

    /**
     * Cria o formulário para adicionar ou editar um membro.
     */
    static createForm() {
        const formContainer = document.getElementById("member-form-container");
        formContainer.replaceChildren();

        const nameInput = toDom("input", { type: "text", id: "member-name", placeholder: "Nome do Membro" });
        const eventTypesContainer = toDom("div", { id: "member-types" });

        EventType.list.forEach(type => {
            const checkbox = toDom("input", { type: "checkbox", value: type.description });
            const label = toDom("label", {}, [checkbox, ` ${type.description}`]);
            eventTypesContainer.append(label, toDom("br"));
        });

        const saveButton = toDom("button", { textContent: "Gravar", onclick: () => Member.save() });
        const cancelButton = toDom("button", { textContent: "Cancelar", onclick: () => Member.cancel() });

        formContainer.append(nameInput, toDom("br"), eventTypesContainer, toDom("br"), saveButton, cancelButton);
    }

    /**
     * Inicia o processo de criação de um novo membro.
     */
    static create() {
        this.selectedIndex = null;
        this.createForm();
    }

    /**
     * Cancela a criação ou edição de um membro e limpa o formulário.
     */
    static cancel() {
        
        const formContainer = document.getElementById("member-form-container");
        formContainer.replaceChildren();
    
        
        this.selectedIndex = null;
    
        
        const rows = document.querySelectorAll("#members-list tr");
        rows.forEach(row => row.classList.remove("selected"));
    }

    /**
     * Guarda os dados do membro (criação ou atualização).
     * @async
     */
    static async save() {
        const name = document.getElementById("member-name").value;
        const preferredTypes = [...document.querySelectorAll("#member-types input:checked")].map(input => input.value);
    
        if (!name || preferredTypes.length === 0) {
            alert("Preencha todos os campos.");
            return;
        }
    
        const memberData = { name, preferredTypes };
    
        try {
            let response;
            if (this.selectedIndex !== null) {
                const member = this.list[this.selectedIndex];
                response = await fetch(`http://localhost:8081/members/${member.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(memberData)
                });
            } else {
                response = await fetch("http://localhost:8081/members", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(memberData)
                });
            }
    
            if (response.ok) {
                await this.fetchMembers();
                document.getElementById("member-form-container").replaceChildren();
            } else {
                alert("Failed to save member.");
            }
        } catch (error) {
            console.error("Failed to save member:", error);
        }
    }

     /**
     * Apaga um membro selecionado após confirmação do utilizador.
     * @async
     */
    static async deleteMember() {
        if (this.selectedIndex === null) {
            alert("Nenhum membro selecionado para apagar.");
            return;
        }
    
        const member = this.list[this.selectedIndex];
        const confirmDelete = confirm(`Tem certeza que deseja apagar o membro "${member.name}"?`);
        if (!confirmDelete) {
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:8081/members/${member.id}`, {
                method: "DELETE"
            });
    
            if (response.ok) {
                
                await this.fetchMembers();
                alert("Membro apagado com sucesso!");
    
                
                this.selectedIndex = null;
    
                
                document.getElementById("member-form-container").replaceChildren();
            } else {
                alert("Erro ao apagar membro.");
            }
        } catch (error) {
            console.error("Failed to delete member:", error);
            alert("Erro ao apagar membro.");
        }
    }

    /**
     * Renderiza a lista de membros na interface.
     */
    static render() {
        const container = document.getElementById("members-list");
        if (!container) {
            console.error("Container 'members-list' not found.");
            return;
        }

        
        container.replaceChildren();

        
        const table = toDom("table", { className: "members-table" });

        
        const headerRow = toDom("tr", {}, [
            toDom("th", { textContent: "#" }),
            toDom("th", { textContent: "Nome" }),
            toDom("th", { textContent: "Tipos Preferenciais" }),
            toDom("th", { textContent: "Eventos Inscritos" })
        ]);
        table.append(headerRow);

        // Popular tabela com mebros
        this.list.forEach((member, index) => {
            const row = toDom("tr", { onclick: () => this.selectMember(index) }, [
                toDom("td", { textContent: index + 1 }),
                toDom("td", { textContent: member.name }),
                toDom("td", { textContent: member.preferredTypes.join(", ") }),
                toDom("td", { textContent: member.enrolledEvents.join(", ") })
            ]);
            table.append(row);
        });

        
        container.append(table);
    }

    /**
     * Seleciona um membro da lista.
     * @param {number} index Índice do membro na lista.
     */
    static selectMember(index) {
        this.selectedIndex = index;
        const rows = document.querySelectorAll("#members-list tr");
        rows.forEach((row, i) => {
            if (i === index + 1) { // Salta o cabeçalho
                row.classList.add("selected");
            } else {
                row.classList.remove("selected");
            }
        });
    }

    /**
     * Edita os dados do membro selecionado.
     */
    static edit() {
        if (this.selectedIndex === null) {
            alert("Nenhum membro selecionado para editar.");
            return;
        }

        this.createForm();
        const member = this.list[this.selectedIndex];
        document.getElementById("member-name").value = member.name;

        // Update checkboxes
        const checkboxes = document.querySelectorAll("#member-types input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = member.preferredTypes.includes(checkbox.value);
        });

        // Add events section
        const formContainer = document.getElementById("member-form-container");
        formContainer.append(toDom("h3", { textContent: "Eventos Inscritos" }));

        const eventsTable = toDom("table", { id: "member-events-table" });
        eventsTable.append(toDom("tr", {}, [toDom("th", { textContent: "Eventos" })]));

        member.enrolledEvents.forEach(event => {
            const row = toDom("tr", {}, [toDom("td", { textContent: event })]);
            row.onclick = () => this.highlightRow(row, eventsTable);
            eventsTable.append(row);
        });

        const enrollButton = toDom("button", { textContent: "Inscrever", onclick: () => Member.enrollEvent() });
        const unenrollButton = toDom("button", { textContent: "Desinscrever", onclick: () => Member.unenrollEvent() });

        formContainer.append(eventsTable, enrollButton, unenrollButton);
    }

    static highlightRow(row, table) {
        Array.from(table.rows).forEach(r => {
            r.style.backgroundColor = "";
            r.style.color = "";
        });
        row.style.backgroundColor = "#003366";
        row.style.color = "#ffffff";
        table.selectedEvent = row.cells[0].textContent;
    }

    /**
     * Inscreve um membro num evento selecionado.
     * @async
     */
    static async enrollEvent() {
        const formContainer = document.getElementById("member-form-container");
    
        
        const existingDropdown = document.getElementById("event-dropdown");
        const existingConfirmButton = document.getElementById("confirm-enrollment-button");
        const existingCancelButton = document.getElementById("cancel-enrollment-button");
        if (existingDropdown) existingDropdown.remove();
        if (existingConfirmButton) existingConfirmButton.remove();
        if (existingCancelButton) existingCancelButton.remove();
    
        
        if (this.selectedIndex === null) {
            alert("Nenhum membro selecionado.");
            return;
        }
        const member = this.list[this.selectedIndex];
    
        try {
            
            const response = await fetch(`http://localhost:8081/members/${member.id}/events`);
            const events = await response.json();
    
            
            const eventDropdown = toDom("select", { id: "event-dropdown" });
            events.forEach(event => {
                eventDropdown.append(toDom("option", { value: event.description, textContent: event.description }));
            });
    
            
            if (events.length === 0) {
                eventDropdown.append(toDom("option", { value: "", textContent: "Nenhum evento disponível", disabled: true }));
            }
    
            
            const confirmButton = toDom("button", { 
                id: "confirm-enrollment-button", 
                textContent: "Confirmar Inscrição", 
                onclick: () => this.confirmEnrollment(eventDropdown) 
            });
    
            
            const cancelButton = toDom("button", { 
                id: "cancel-enrollment-button", 
                textContent: "Cancelar", 
                onclick: () => this.cancelEnrollment() 
            });
    
            // Cria o container para a dropdown e os botoes
            const eventActionContainer = toDom("div", { id: "event-action-container" }, [eventDropdown, confirmButton, cancelButton]);
    
            // Inserir eventActionContainer depois de "Desinscrever" 
            const unenrollButton = formContainer.querySelector("button[onclick*='unenrollEvent']");
            if (unenrollButton) {
                unenrollButton.after(eventActionContainer);
            } else {
                formContainer.append(eventActionContainer); // Volta para trás se não encontrar desinscrever
            }
        } catch (error) {
            console.error("Failed to fetch events for member:", error);
            alert("Erro ao carregar eventos.");
        }
    }

    /**
     * Confirma a inscrição de um membro num evento.
     * @param {HTMLSelectElement} dropdown Elemento dropdown com os eventos disponíveis.
     * @async
     */
    static async confirmEnrollment(dropdown) {
        const selectedEventDescription = dropdown.value;
        if (!selectedEventDescription) {
            alert("Por favor, selecione um evento válido.");
            return;
        }
    
        
        const selectedEvent = Event.list.find(event => event.description === selectedEventDescription);
        if (!selectedEvent) {
            alert("Evento não encontrado.");
            return;
        }
    
        const memberId = this.list[this.selectedIndex].id;
        const eventId = selectedEvent.id;
    
        try {
            const response = await fetch(`http://localhost:8081/members/${memberId}/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId })
            });
    
            if (response.ok) {
                
                await this.fetchMembers();
                alert("Inscrição realizada com sucesso!");
    
                
                this.edit();
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Erro ao inscrever no evento.");
            }
        } catch (error) {
            console.error("Failed to enroll member in event:", error);
            alert("Erro, evento no passado.");
        }
    }

    /**
     * Cancela o processo de inscrição num evento.
     */
    static cancelEnrollment() {
        const formContainer = document.getElementById("member-form-container");

        
        const existingDropdown = document.getElementById("event-dropdown");
        const existingConfirmButton = document.getElementById("confirm-enrollment-button");
        const existingCancelButton = document.getElementById("cancel-enrollment-button");
        if (existingDropdown) existingDropdown.remove();
        if (existingConfirmButton) existingConfirmButton.remove();
        if (existingCancelButton) existingCancelButton.remove();
    }

    /**
     * Remove um membro de um evento em que está inscrito.
     * @async
     */
    static async unenrollEvent() {
        const eventsTable = document.getElementById("member-events-table");
        if (!eventsTable.selectedEvent) {
            alert("Por favor, selecione um evento para desinscrever.");
            return;
        }
    
        const member = this.list[this.selectedIndex];
        const eventDescription = eventsTable.selectedEvent;
    
        // procura o event ID de Event.list usando a descrição selecionada
        const selectedEvent = Event.list.find(event => event.description === eventDescription);
        if (!selectedEvent) {
            alert("Evento não encontrado.");
            return;
        }
    
        const memberId = member.id;
        const eventId = selectedEvent.id;
    
        try {
            const response = await fetch(`http://localhost:8081/members/${memberId}/unenroll`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId })
            });
    
            if (response.ok) {
            
                await this.fetchMembers();
                alert("Desinscrição realizada com sucesso!");
    
                // atualiza a tabela de eventos para o membro selecioando
                this.edit();
            } else {
                alert("Erro ao desinscrever do evento.");
            }
        } catch (error) {
            console.error("Failed to unenroll member from event:", error);
            alert("Erro ao desinscrever do evento.");
        }
    }
}

/**
 * Classe que representa os tipos de eventos no sistema.
 * Inclui funcionalidades para listar, criar, editar, excluir e selecionar tipos de evento.
 */
class EventType {
    static list = [];
    static selectedIndex = null;

    // Vai buscar os tipos de evento ao backend
    /**
     * Obtém todos os tipos de eventos do servidor e atualiza a lista local.
     * @async
     */
    static async fetchEventTypes() {
        try {
            const response = await fetch("http://localhost:8081/event-types");
            if (response.ok) {
                this.list = await response.json();
                this.render();
            } else {
                this.showError("Failed to fetch event types.");
            }
        } catch (error) {
            this.showError("An error occurred while fetching event types.");
        }
    }

     /**
     * Cria um novo tipo de evento.
     * Solicita uma descrição do tipo de evento ao usuário e envia ao servidor.
     * @async
     */
    static async create() {
        const description = prompt("Escreva a descrição do tipo de evento:");
        if (description) {
            try {
                const response = await fetch("http://localhost:8081/event-types", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description }),
                });
                if (response.ok) {
                    await this.fetchEventTypes(); // Refresh á list
                } else {
                    this.showError("Failed to create event type.");
                }
            } catch (error) {
                this.showError("An error occurred while creating the event type.");
            }
        }
    }

    /**
     * Edita a descrição de um tipo de evento existente.
     * Solicita ao usuário uma nova descrição e atualiza o tipo de evento no servidor.
     * @async
     */
    static async edit() {
        if (this.selectedIndex === null) {
            this.showError("Selecione um tipo de evento para editar.");
            return;
        }

        const selectedEventType = this.list[this.selectedIndex];
        const newDescription = prompt("Edite a descrição do tipo de evento:", selectedEventType.description);
        if (newDescription) {
            try {
                const response = await fetch(`http://localhost:8081/event-types/${selectedEventType.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description: newDescription }),
                });
                if (response.ok) {
                    await this.fetchEventTypes(); 
                } else {
                    this.showError("Failed to update event type.");
                }
            } catch (error) {
                this.showError("An error occurred while updating the event type.");
            }
        }
    }

    /**
     * Exclui um tipo de evento após confirmação do usuário.
     * @async
     */
    static async delete() {
        if (this.selectedIndex === null) {
            this.showError("Selecione um tipo de evento para apagar.");
            return;
        }

        const selectedEventType = this.list[this.selectedIndex];
        const confirmDelete = confirm(`Tem certeza que deseja apagar o tipo de evento "${selectedEventType.description}"?`);
        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/event-types/${selectedEventType.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await this.fetchEventTypes(); 
            } else {
                const errorData = await response.json();
                this.showError(errorData.message || "Failed to delete event type.");
            }
        } catch (error) {
            console.error("Error deleting event type:", error);
            this.showError("Impossível apagar tipo de evento porque já está num evento/menbro");
        }
    }

    /**
     * Seleciona um tipo de evento da lista.
     * @param {number} index Índice do tipo de evento a ser selecionado.
     */
    static select(index) {
        this.selectedIndex = index;
        this.render();
    }

     /**
     * Renderiza a lista de tipos de eventos na interface.
     */
    static render() {
        const container = document.getElementById("event-types-list");
        container.replaceChildren(...this.list.map((type, index) =>
            toDom("div", {
                style: { backgroundColor: index === this.selectedIndex ? "#e0f2f1" : "transparent", cursor: "pointer" },
                onclick: () => this.select(index),
            }, `${index + 1}. ${type.description}`)
        ));
        this.clearError();
    }

     /**
     * Exibe uma mensagem de erro.
     * @param {string} message Mensagem de erro a ser exibida.
     */
    static showError(message) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.textContent = message;
    }

    /**
     * Limpa a mensagem de erro.
     */
    static clearError() {
        const errorMessage = document.getElementById("error-message");
        errorMessage.textContent = "";
    }
}

/**
 * Classe que representa e gere os eventos no sistema.
 * Esta classe fornece métodos para criar, ler, atualizar, eliminar e renderizar eventos.
 */
class Event {
    static list = [];
    static selectedIndex = null;

    /**
     * Buscar todos os eventos do backend.
     * Este método busca os dados dos eventos no servidor e renderiza a lista de eventos.
     */
    static async fetchEvents() {
        try {
            const response = await fetch("http://localhost:8081/events");
            if (response.ok) {
                this.list = await response.json();
                this.render();
            } else {
                this.showError("Failed to fetch events.");
            }
        } catch (error) {
            this.showError("An error occurred while fetching events.");
        }
    }

     /**
     * Mostrar o formulário de criação de evento.
     * Este método limpa quaisquer dados existentes no formulário e prepara o formulário para um novo evento.
     */
    static create() {
        this.showForm();
        this.clearForm();
        this.selectedIndex = null;
        this.populateEventTypes();
    }

    /**
     * Guardar ou atualizar um evento.
     * Se um evento estiver selecionado, ele será atualizado; caso contrário, um novo evento será criado.
     */
    static async save() {
        const type_id = document.getElementById("event-type").value;
        const description = document.getElementById("event-description").value;
        const date = document.getElementById("event-date").value;

        if (!type_id || !description || !date) {
            this.showError("Todos os campos são obrigatórios.");
            return;
        }

        try {
            if (this.selectedIndex === null) {
                // Create new event
                const response = await fetch("http://localhost:8081/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description, type_id, date }),
                });
                if (!response.ok) throw new Error();
            } else {
                // Update existing event
                const selectedEvent = this.list[this.selectedIndex];
                const response = await fetch(`http://localhost:8081/events/${selectedEvent.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description, type_id, date }),
                });
                if (!response.ok) throw new Error();
            }
            
            await this.fetchEvents(); // Refresh the list
            this.hideForm();
        } catch (error) {
            this.showError("Failed to save event.");
        }
    }

    /**
     * Editar um evento existente.
     * Este método preenche o formulário com os dados do evento selecionado para edição.
     */
    static edit() {
        if (this.selectedIndex === null) {
            this.showError("Selecione um evento para editar.");
            return;
        }

        const selectedEvent = this.list[this.selectedIndex];
        this.showForm();
        this.populateEventTypes();
        
        document.getElementById("event-type").value = selectedEvent.type_id;
        document.getElementById("event-description").value = selectedEvent.description;
        document.getElementById("event-date").value = selectedEvent.date;
    }

    /**
     * Eliminar um evento.
     * Este método solicita confirmação do utilizador antes de apagar o evento selecionado.
     */
    static async delete() {
        if (this.selectedIndex === null) {
            this.showError("Selecione um evento para apagar.");
            return;
        }
    
        const selectedEvent = this.list[this.selectedIndex];
        const confirmDelete = confirm(`Tem certeza que deseja apagar o evento "${selectedEvent.description}"?`);
        if (!confirmDelete) {
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:8081/events/${selectedEvent.id}`, {
                method: "DELETE",
            });
    
            if (response.ok) {
                await this.fetchEvents(); 
            } else {
                const errorData = await response.json();
                this.showError(errorData.error || "Failed to delete event.");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            this.showError("Impossível apagar evento com menbros inscritos.");
        }
    }

    /**
     * Selecionar um evento na lista.
     * Este método marca o evento selecionado e renderiza a lista atualizada.
     * 
     * @param {number} index Índice do evento a ser selecionado.
     */
    static select(index) {
        this.selectedIndex = index;
        this.render();
    }

    /**
     * Renderizar a lista de eventos.
     * Este método atualiza o conteúdo da lista de eventos na interface do utilizador.
     */
    static render() {
        const container = document.getElementById("events-list");
        container.replaceChildren(...this.list.map((event, index) =>
            toDom("div", {
                style: { backgroundColor: index === this.selectedIndex ? "#e0f2f1" : "transparent", cursor: "pointer" },
                onclick: () => this.select(index),
            }, `${index + 1}. ${event.description} (${event.type_description}) - ${new Date(event.date).toLocaleDateString()}`)
        ));
        this.clearError();
    }

    /**
     * Preencher o dropdown de tipos de evento.
     * Este método preenche a lista de tipos de eventos disponíveis no formulário.
     */
    static populateEventTypes() {
        const dropdown = document.getElementById("event-type");
        dropdown.replaceChildren(...EventType.list.map(type =>
            toDom("option", { value: type.id }, type.description)
        ));

        if (EventType.list.length === 0) {
            dropdown.append(toDom("option", { value: "" }, "Nenhum tipo disponível"));
        }
    }

    /**
     * Mostrar o formulário de eventos.
     * Este método exibe o formulário de criação ou edição de eventos.
     */
    static showForm() {
        document.getElementById("event-form").classList.remove("hidden");
    }

    /**
     * Ocultar o formulário de eventos.
     * Este método oculta o formulário de criação ou edição de eventos.
     */
    static hideForm() {
        document.getElementById("event-form").classList.add("hidden");
    }

    /**
     * Limpar os dados do formulário de eventos.
     * Este método limpa os campos do formulário de eventos.
     */
    static clearForm() {
        document.getElementById("event-type").value = "";
        document.getElementById("event-description").value = "";
        document.getElementById("event-date").value = "";
    }

    /**
     * Cancelar o formulário e ocultá-lo.
     * Este método cancela a operação e fecha o formulário sem fazer alterações.
     */
    static cancel() {
        this.hideForm();
        this.clearForm();
        this.selectedIndex = null;
    }

    /**
     * Mostrar uma mensagem de erro.
     * Este método exibe uma mensagem de erro na interface do utilizador.
     * 
     * @param {string} message A mensagem de erro a ser exibida.
     */
    static showError(message) {
        document.getElementById("event-error").textContent = message;
    }

    /**
     * Limpar a mensagem de erro.
     * Este método remove qualquer mensagem de erro exibida anteriormente.
     */
    static clearError() {
        document.getElementById("event-error").textContent = "";
    }
}


/**
 * Mostrar uma seção específica da interface.
 * Este método oculta todas as seções e exibe a seção correspondente ao ID fornecido.
 * 
 * @param {string} sectionId O ID da seção a ser exibida.
 */
function showSection(sectionId) {
    document.querySelectorAll("main > section").forEach(section => section.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");
}

/**
 * Criar um elemento DOM com as propriedades especificadas.
 * Este método cria um novo elemento HTML com as propriedades e filhos fornecidos.
 * 
 * @param {string} tag A tag HTML do elemento a ser criado.
 * @param {Object} attributes Um objeto de atributos para o elemento.
 * @param {Array|string} children Os filhos do elemento (pode ser uma string ou um array de elementos).
 * @returns {HTMLElement} O elemento criado.
 */
function toDom(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    if (typeof children === "string") {
        element.textContent = children;
    } else {
        element.append(...children);
    }
    return element;
}


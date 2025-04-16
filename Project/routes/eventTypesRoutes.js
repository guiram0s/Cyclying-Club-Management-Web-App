//Guilherme Ramos 202200083 202200083@estudantes.ips.pt  JoaoFelicio 202200033 202200033@estudantes.ips.pt
"use strict";
import { string, sendResponse, sendError, execute } from "../scripts/db.js";

const commandCreate = "INSERT INTO event_types (description) VALUES (?)";
const commandUpdate = "UPDATE event_types SET description = ? WHERE id = ?";
const commandDelete = "DELETE FROM event_types WHERE id = ?";

/**
 * Verifica se o tipo de evento está associado a algum membro.
 * @param {number} eventTypeId - O ID do tipo de evento.
 * @returns {Promise<boolean>} - Verdadeiro se o tipo de evento estiver associado a um membro.
 */
const checkMemberDependency = async (eventTypeId) => {
    const command = "SELECT COUNT(*) AS member_count FROM member_preferred_event_types WHERE event_type_id = ?";
    const result = await execute(command, [eventTypeId]);
    console.log("Resultado da verificação de dependência de membro:", result);
    return result?.[0]?.member_count > 0;
};

/**
 * Verifica se o tipo de evento está associado a algum evento.
 * @param {number} eventTypeId - O ID do tipo de evento.
 * @returns {Promise<boolean>} - Verdadeiro se o tipo de evento estiver associado a um evento.
 */
const checkEventDependency = async (eventTypeId) => {
    const command = "SELECT COUNT(*) AS event_count FROM events WHERE type_id = ?";
    const result = await execute(command, [eventTypeId]);
    console.log("Resultado da verificação de dependência de evento:", result);
    return result?.[0]?.event_count > 0;
};

/**
 * Configura as rotas para operações relacionadas com tipos de eventos.
 * @param {Object} app - A instância da aplicação Express.
 */
export default async function eventTypesRoutes(app) {
    /**
     * Obtém todos os tipos de eventos.
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.get("/event-types", async (request, response) => {
        console.log("A obter tipos de eventos...");
        await sendResponse(response, "SELECT * FROM event_types");
    });

    /**
     * Cria um novo tipo de evento.
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.post("/event-types", async (request, response) => {
        console.log("Pedido POST recebido em /event-types");
        const description = string(request.body.description);
        if (description) {
            console.log("A criar tipo de evento com descrição:", description);
            await sendResponse(response, commandCreate, [description], (result) => ({
                id: result.insertId,
                description,
            }));
        } else {
            console.log("Descrição inválida fornecida");
            sendError(response, "Deve fornecer uma descrição para o tipo de evento!");
        }
    });

    /**
     * Atualiza um tipo de evento existente.
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.put("/event-types/:id", async (request, response) => {
        const id = Number(request.params.id);
        const description = string(request.body.description);
        if (id && description) {
            await sendResponse(response, commandUpdate, [description, id], () => ({
                id,
                description,
            }));
        } else {
            sendError(response, "Deve fornecer um ID válido e uma descrição!");
        }
    });

    /**
     * Elimina um tipo de evento verificando se está associado a membros ou a eventos
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.delete("/event-types/:id", async (request, response) => {
        const id = Number(request.params.id);
        if (!id) {
            return sendError(response, "Deve fornecer um ID válido!");
        }

        try {
            const isUsedByMember = await checkMemberDependency(id);
            if (isUsedByMember) {
                return sendError(
                    response,
                    "Não é possível eliminar o tipo de evento: Está associado a um ou mais membros."
                );
            }

            const isUsedByEvent = await checkEventDependency(id);
            if (isUsedByEvent) {
                return sendError(
                    response,
                    "Não é possível eliminar o tipo de evento: Está associado a um ou mais eventos."
                );
            }

            await sendResponse(response, commandDelete, [id], () => ({
                id,
            }));
        } catch (error) {
            console.error("Erro ao eliminar tipo de evento:", error);
            sendError(response, "Ocorreu um erro ao eliminar o tipo de evento.");
        }
    });
}

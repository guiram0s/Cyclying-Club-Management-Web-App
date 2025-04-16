//Guilherme Ramos 202200083 202200083@estudantes.ips.pt  JoaoFelicio 202200033 202200033@estudantes.ips.pt

"use strict";
import mysql from "mysql2/promise";
import connectionOptions from "./connection-options.js";

/**
 * Executa um comando SQL na base de dados.
 * @param {string} command - O comando SQL a executar.
 * @param {Array} [parameters=[]] - Os parâmetros para o comando SQL.
 * @returns {Promise<any>|undefined} - O resultado da execução do comando ou undefined em caso de erro.
 */
async function execute(command, parameters = []) {
    let connection;
    try {
        connection = await mysql.createConnection(connectionOptions);
        console.log("A executar query:", command, parameters);
        let [result] = await connection.execute(command, parameters);
        return result;
    } catch (error) {
        console.error("Erro na base de dados:", error);
        return void 0;
    } finally {
        connection?.end();
    }
}

/**
 * Converte um valor para número.
 * @param {any} value - O valor a converter.
 * @returns {number|undefined} - O número convertido ou undefined se não for um número válido.
 */
function number(value) {
    let result = Number(value);
    return isNaN(result) ? void 0 : result;
}

/**
 * Converte um valor para string.
 * @param {any} value - O valor a converter.
 * @returns {string|undefined} - A string convertida ou undefined se o valor for indefinido.
 */
function string(value) {
    return value === undefined ? void 0 : String(value);
}

/**
 * Converte um valor para uma data no formato YYYY-MM-DD.
 * @param {any} value - O valor a converter.
 * @returns {string|undefined} - A data formatada ou undefined se não for uma data válida.
 */
function date(value) {
    let result = new Date(String(value));
    return isNaN(result.getTime()) ? void 0 : result.toISOString().slice(0, 10);
}

/**
 * Converte um valor para booleano numérico (1 ou 0).
 * @param {any} value - O valor a converter.
 * @param {boolean} [forceValue=false] - Se true, retorna false em caso de valor inválido.
 * @returns {number|undefined} - 1 para verdadeiro, 0 para falso, ou undefined se não for reconhecido.
 */
function boolean(value, forceValue = false) {
    let result;
    if (typeof value === "boolean") {
        result = value;
    } else if (typeof value === "string") {
        value = value.toLowerCase();
        result = value === "true" || (value === "false" ? false : void 0);
    }
    return result === void 0 ? (forceValue ? false : void 0) : Number(result);
}

/**
 * Converte um valor para booleano verdadeiro ou falso.
 * @param {any} value - O valor a converter.
 * @returns {boolean} - O valor convertido para booleano.
 */
function toBoolean(value) {
    return Boolean(value);
}

/**
 * Envia uma resposta de erro ao cliente.
 * @param {Object} response - O objeto de resposta HTTP.
 * @param {string} [error=""] - A mensagem de erro.
 * @param {number} [status=400] - O código de estado HTTP.
 */
function sendError(response, error = "", status = 400) {
    response.status(status).end(typeof error === "string" ? error : "");
}

/**
 * Executa um comando SQL e envia a resposta ao cliente.
 * @param {Object} response - O objeto de resposta HTTP.
 * @param {string} command - O comando SQL a executar.
 * @param {Array} [parameters=[]] - Os parâmetros para o comando SQL.
 * @param {Function} [processResult] - Função opcional para processar o resultado antes de enviá-lo.
 */
async function sendResponse(response, command, parameters, processResult) {
    let result = await execute(command, parameters);
    if (result) {
        response.json(result);
    } else {
        sendError(response, "", 500);
    }
}

export { execute, number, string, date, boolean, toBoolean, sendError, sendResponse };

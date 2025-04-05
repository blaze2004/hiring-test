const { db, initializeDatabase } = require("../core/db");

const AuditType = Object.freeze({
    USER_LOGIN: "USER_LOGIN",
    USER_LOGOUT: "USER_LOGOUT",
    USER_REGISTER: "USER_REGISTER",
    TODOS_READ: "TODOS_READ",
    TODO_CREATE: "TODO_CREATE",
    TODO_UPDATE: "TODO_UPDATE",
    TODO_DELETE: "TODO_DELETE",

    /**
     * @param {string} path
     * @param {string} method
     * @returns {AuditType | null}
     */
    fromRequest(path, method) {
        if (path == "/api/todos") {
            if (method == "GET") {
                return this.TODOS_READ;
            } else if (method == "POST") {
                return this.TODO_CREATE;
            } else if (method == "PUT") {
                return this.TODO_UPDATE;
            } else if (method == "DELETE") {
                return this.TODO_DELETE;
            }

            return null;
        }

        if (path.includes("/api/auth")) {
            let pathParts = path.split("/");
            let lastPath = pathParts[pathParts.length - 1];

            if (lastPath == "login") {
                return this.USER_LOGIN;
            } else if (lastPath == "register") {
                return this.USER_REGISTER;
            }

            return null;
        }
    },
});

class Auditor {
    constructor() {
        this.audits = [];
    }

    _logInDB() {}

    /**
     * @param {AuditType} type
     * @param {any} data
     */
    audit(type, data) {
        switch (type) {
            case AuditType.USER_LOGIN:
                const { email } = data.body;
                this._auditUserLogin(email);
                break;
            case AuditType.USER_REGISTER:
                break;
            case AuditType.USER_LOGOUT:
                break;
            case AuditType.TODOS_READ:
                break;
            case AuditType.TODO_CREATE:
                break;
            case AuditType.TODO_DELETE:
                break;
            case AuditType.TODO_UPDATE:
                break;
            default:
                break;
        }
    }
    async _auditUserLogin(email) {
        const user = await db.get("SELECT * FROM users WHERE email = ?", [
            email,
        ]);
    }
    _auditUserLogout() {}
    _auditUserRegister() {}
    _auditTodosRead() {}
    _auditTodoCreate() {}
    _auditTodoUpdate() {}
    _auditTodoDelete() {}
}

/**
 * @param {Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>} req
 * @param {Response<any, Record<string, any>, number>} res
 * @param {NextFunction} next
 */
async function auditInterceptor(req, res, next) {
    let path = req.path;
    let method = req.method;

    console.log("Audit Interceptor: ", path, method);

    let auditType = AuditType.fromRequest(path, method);

    console.log(auditType);

    if (auditType == null) {
        return next();
    }

    auditor.audit(auditType, req);

    next();
}

let auditor = new Auditor();

module.exports = auditInterceptor;

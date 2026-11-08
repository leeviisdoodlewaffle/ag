const { logInfo } = require("../utils/logger");
const { renderGatewayError } = require("../views/errorPages");

const SQL_INJECTION_RULES = [
  {
    id: "sql-union-select",
    pattern: /\bunion\s+(?:all\s+)?select\b/i,
  },
  {
    id: "sql-boolean-tautology",
    pattern: /(?:\b(?:or|and)\s+)?(?:['"]?\s*)\d+\s*(?:=|<>|!=)\s*\d+\b|\b(?:or|and)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/i,
  },
  {
    id: "sql-inline-tautology",
    pattern: /(?:^|[?&])\d+\s*or\s*\d+(?:=|&|$)|\b\d+\s+or\s+\d+\b/i,
  },
  {
    id: "sql-stacked-statement",
    pattern: /;\s*(?:select|insert|update|delete|drop|alter|create|exec(?:ute)?)\b/i,
  },
  {
    id: "sql-destructive-statement",
    pattern: /\b(?:drop\s+(?:table|database)|truncate\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)\b/i,
  },
  {
    id: "sql-query-comment",
    pattern: /(?:--|#|\/\*)\s*(?:$|\s)/,
  },
  {
    id: "sql-time-delay",
    pattern: /\b(?:sleep|benchmark)\s*\(|\bwaitfor\s+delay\b/i,
  },
  {
    id: "sql-sensitive-function",
    pattern: /\binformation_schema\b|\b(?:xp_cmdshell|load_file)\s*\(/i,
  },
];

function decodeInput(value) {
  let decoded = value;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded.replace(/\+/g, " "));
      if (next === decoded) {
        break;
      }
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function findSqlInjectionRule(input) {
  if (typeof input !== "string") {
    return null;
  }

  const decoded = decodeInput(input);
  return SQL_INJECTION_RULES.find(({ pattern }) => pattern.test(decoded)) || null;
}

function sqlInjectionFilter(req, res, next) {
  const query = req.originalUrl.split("?").slice(1).join("?");
  const body = req.body === undefined ? "" : JSON.stringify(req.body);
  const rule = findSqlInjectionRule(`${query}&${body}`);

  if (!rule) {
    return next();
  }

  logInfo("request_blocked", {
    host: req.hostname,
    method: req.method,
    path: req.path,
    reason: "sql_injection_pattern",
    ruleId: rule.id,
  });

  return renderGatewayError(req, res, 403);
}

module.exports = {
  SQL_INJECTION_RULES,
  findSqlInjectionRule,
  sqlInjectionFilter,
};

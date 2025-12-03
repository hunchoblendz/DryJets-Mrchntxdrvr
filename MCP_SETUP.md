# Supabase MCP Integration

**Date:** November 10, 2025
**Status:** ✅ Configured

---

## What is MCP?

The **Model Context Protocol (MCP)** is a standardized way for AI assistants like Claude to interact with external services and tools. By adding the Supabase MCP server, Claude Code can now directly interact with your Supabase database.

---

## Configuration

The Supabase MCP server has been added to `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=qehmkzswoevocrvrssuc"
    }
  }
}
```

**Project Reference:** `qehmkzswoevocrvrssuc`

---

## Available Capabilities

With the Supabase MCP, Claude Code can now:

### Database Operations
- 🔍 **Query database tables** directly
- 📊 **View table schemas** and relationships
- 🔧 **Execute SQL queries** safely
- 📈 **Check database health** and performance
- 🔄 **Monitor real-time connections**

### Schema Management
- 📋 **List all tables** in your database
- 🔍 **Inspect table structures** (columns, types, constraints)
- 🔗 **View foreign key relationships**
- 📊 **Check indexes** and performance optimizations

### Data Operations
- 📖 **Read data** from tables
- 🔍 **Search and filter** records
- 📊 **Aggregate queries** (counts, sums, averages)
- 🔗 **Join operations** across tables

### Monitoring
- 📈 **Connection pool status**
- ⚡ **Query performance metrics**
- 🔒 **Row-level security policies**
- 🔄 **Real-time subscription status**

---

## Benefits Over Direct Prisma

While we use Prisma for application code, the Supabase MCP provides:

1. **Direct Database Access:** Bypass application code for debugging
2. **Real-time Inspection:** Check database state without running migrations
3. **Quick Queries:** Run ad-hoc SQL without writing TypeScript
4. **Schema Validation:** Verify Prisma schema matches actual database
5. **Performance Insights:** Monitor query execution and bottlenecks

---

## Common Use Cases

### 1. Verify Database Schema
```
Ask Claude: "Show me the structure of the Order table"
Claude will use MCP tools to inspect the actual database schema
```

### 2. Check Data Integrity
```
Ask Claude: "How many orders are in the database?"
Claude will query the database directly
```

### 3. Debug Issues
```
Ask Claude: "Show me the last 10 orders created"
Claude will fetch recent orders without running the app
```

### 4. Migration Validation
```
Ask Claude: "Compare the Prisma schema with the actual database"
Claude can verify migrations were applied correctly
```

### 5. Performance Analysis
```
Ask Claude: "Which queries are slowest on the Order table?"
Claude can inspect query performance
```

---

## Security Considerations

### What the MCP Can Do:
- ✅ Read data from all tables
- ✅ Execute SELECT queries
- ✅ Inspect schema and structure
- ✅ Monitor performance

### What the MCP Cannot Do:
- ❌ Modify data (INSERT, UPDATE, DELETE)
- ❌ Change schema (ALTER, DROP)
- ❌ Access sensitive credentials
- ❌ Bypass row-level security

The MCP has **read-only** access to your database for safety.

---

## Integration with Our Stack

### Works Alongside:
- **Prisma:** For application code and type-safe queries
- **Supabase Dashboard:** For visual database management
- **PostgreSQL CLI:** For advanced admin tasks

### Enhances:
- **Development workflow:** Quick debugging without app restart
- **Data exploration:** Understand data patterns
- **Schema validation:** Ensure migrations are correct
- **Performance tuning:** Identify slow queries

---

## Example Workflows

### Workflow 1: Post-Migration Validation
```
1. Run: npm run db:migrate
2. Ask Claude: "Verify the Order table has the shortCode column"
3. Claude uses MCP to check actual database schema
4. Confirms migration was successful
```

### Workflow 2: Data Analysis
```
1. Ask Claude: "Show me order statistics by status"
2. Claude queries database via MCP
3. Returns aggregated data without writing code
```

### Workflow 3: Debugging
```
1. Bug report: "Order DJ-1234 is missing"
2. Ask Claude: "Find order with shortCode 'DJ-1234'"
3. Claude searches database and returns results
4. Identifies issue (e.g., order exists but shortCode wasn't set)
```

---

## Next Steps

Now that the MCP is configured, you can:

1. **Test the connection:**
   ```
   Ask: "List all tables in the Supabase database"
   ```

2. **Verify schema:**
   ```
   Ask: "Show me the Order table structure"
   ```

3. **Run migrations:**
   ```bash
   cd packages/database
   npm run db:migrate
   ```

4. **Validate migration:**
   ```
   Ask: "Confirm the Order table has BigInt ID and shortCode fields"
   ```

---

## Troubleshooting

### MCP Not Responding
- Check `.mcp.json` configuration
- Verify project reference is correct
- Restart Claude Code

### Connection Errors
- Verify Supabase project is active
- Check DATABASE_URL in .env
- Ensure network connectivity

### Permission Issues
- MCP uses project-level permissions
- Check Supabase project settings
- Verify API keys if needed

---

## Resources

- **Supabase MCP Docs:** [supabase.com/docs/guides/mcp](https://supabase.com/docs/guides/mcp)
- **Model Context Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Supabase Dashboard:** [app.supabase.com/project/qehmkzswoevocrvrssuc](https://app.supabase.com/project/qehmkzswoevocrvrssuc)

---

## Configuration Summary

| Setting | Value |
|---------|-------|
| **Project Ref** | `qehmkzswoevocrvrssuc` |
| **MCP Type** | HTTP |
| **MCP URL** | `https://mcp.supabase.com/mcp?project_ref=qehmkzswoevocrvrssuc` |
| **Config File** | `.mcp.json` |
| **Scope** | Project |
| **Access Level** | Read-only |

---

**Status:** ✅ Configured and ready to use!


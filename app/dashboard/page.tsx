import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addTodo, toggleTodo, deleteTodo } from "./actions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // No .eq("user_id") needed for security — RLS filters to the caller's rows.
  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, title, is_complete, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="container">
      <div className="card">
        <div className="header">
          <div>
            <h1>My todos</h1>
            <span className="muted">{user.email}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button>Sign out</button>
          </form>
        </div>

        <form action={addTodo} className="add">
          <input name="title" type="text" placeholder="What needs doing?" required maxLength={500} />
          <button className="primary">Add</button>
        </form>

        {error && <div className="alert error">{error.message}</div>}

        {todos && todos.length === 0 ? (
          <p className="empty">Nothing here yet. Add your first task above.</p>
        ) : (
          <ul className="todos">
            {todos?.map((t) => (
              <li key={t.id} className={`todo ${t.is_complete ? "done" : ""}`}>
                <form action={toggleTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="is_complete" value={String(!t.is_complete)} />
                  <button
                    className={`check ${t.is_complete ? "on" : ""}`}
                    aria-label={t.is_complete ? "Mark incomplete" : "Mark complete"}
                  >
                    {t.is_complete ? "✓" : ""}
                  </button>
                </form>
                <span className="title">{t.title}</span>
                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="del">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

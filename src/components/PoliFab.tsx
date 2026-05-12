import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { getDeviceId } from "@/lib/device";

interface Msg { role: "user" | "assistant"; content: string }

const POLI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/poli`;

export const PoliFab = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const deviceId = getDeviceId();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch(POLI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, device_id: deviceId }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Xatolik" }));
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: `⚠️ ${err.error}` }; return c; });
        setStreaming(false); return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = ""; let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) { acc += delta; setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; }); }
          } catch {}
        }
      }
    } catch (e: any) {
      setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: `⚠️ ${e.message}` }; return c; });
    } finally { setStreaming(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 via-sky-500 to-violet-600 shadow-glow flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Poli"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md h-[80vh] glass rounded-t-3xl flex flex-col shadow-glow" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-600 flex items-center justify-center shadow-glow">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Poli</p>
                  <p className="text-[11px] text-muted-foreground">Sizning yordamchingiz</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center pt-10">
                  <p className="text-4xl mb-3">👋</p>
                  <p className="text-sm text-muted-foreground">Salom! Men Poli. Ilova, darslar yoki ingliz tili haqida so'rang.</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {["Ilova qanday ishlaydi?", "Premium nima beradi?", "A1 darsida nimalar bor?"].map((s) => (
                      <button key={s} onClick={() => setInput(s)} className="text-xs px-3 py-1.5 rounded-full glass shadow-soft">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-emerald-500 to-violet-600 text-white rounded-br-sm shadow-glow"
                      : "glass shadow-soft rounded-bl-sm"
                  }`}>
                    {m.role === "assistant"
                      ? <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-1"><ReactMarkdown>{m.content || "…"}</ReactMarkdown></div>
                      : m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border/50 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Savolingizni yozing..."
                disabled={streaming}
                className="flex-1 h-12 px-4 rounded-2xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={send} disabled={streaming || !input.trim()} className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-600 shadow-glow" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

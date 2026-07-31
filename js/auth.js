// ============================================================
// Controle de Frota — Portão de autenticação (Supabase Auth)
// ------------------------------------------------------------
// Login SOMENTE com Google (auth.users compartilhada da Young) + 2ª validação
// própria: só entra quem tem role em frota_user_roles E frota_profiles.ativo.
// Quem loga sem acesso gera/reabre um pedido em frota_solicitacao_acesso;
// admins aprovam/recusam num card na home. Espelha o padrão do Paver.
//
// Requer (carregar ANTES deste arquivo):
//   - @supabase/supabase-js (CDN, global `supabase`)
//   - js/supabase.js  (SUPABASE_URL, SUPABASE_ANON_KEY, SupabaseClient)
// ============================================================

const FrotaAuth = (function () {
    if (typeof supabase === 'undefined' || !supabase.createClient) {
        console.error('[FrotaAuth] supabase-js não carregou. Verifique o <script> do CDN.');
    }

    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        }
    });

    const state = { user: null, isAdmin: false, hasAccess: false };
    let resolveReady;
    const ready = new Promise((res) => { resolveReady = res; });

    // Mantém o token do SupabaseClient (chamadas REST) sempre em dia.
    sb.auth.onAuthStateChange((_event, session) => {
        if (session && session.access_token) {
            SupabaseClient.setToken(session.access_token);
        }
    });

    // ---------------- Ações de sessão ----------------
    async function signInWithGoogle() {
        const btn = document.getElementById('frota-btn-google');
        if (btn) { btn.disabled = true; btn.classList.add('is-loading'); }
        const redirectTo = window.location.origin + window.location.pathname;
        const { error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo, queryParams: { prompt: 'select_account' } }
        });
        if (error) {
            if (btn) { btn.disabled = false; btn.classList.remove('is-loading'); }
            alert('Não foi possível iniciar o login com Google: ' + error.message);
        }
    }

    async function signOut() {
        try { await sb.auth.signOut(); } catch (e) { /* ignora */ }
        SupabaseClient.setToken(null);
        window.location.reload();
    }

    // ---------------- Portão ----------------
    async function guard() {
        injectStyles();
        showOverlay('checking');

        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
            showOverlay('login');
            return;
        }

        SupabaseClient.setToken(session.access_token);
        state.user = session.user;

        let acesso = { tem_acesso: false, is_admin: false };
        try {
            const { data, error } = await sb.rpc('frota_meu_acesso');
            if (error) throw error;
            if (data) acesso = data;
        } catch (e) {
            console.error('[FrotaAuth] erro ao verificar acesso:', e);
        }

        if (acesso.tem_acesso) {
            state.hasAccess = true;
            state.isAdmin = !!acesso.is_admin;
            removeOverlay();
            injectUserChip(acesso);
            resolveReady(state);
            if (state.isAdmin) renderAdminCard();
        } else {
            // Sem acesso ativo → registra/reabre a solicitação e mostra tela de pendência.
            try { await sb.rpc('frota_registrar_solicitacao_acesso'); } catch (e) { /* ignora */ }
            showOverlay('pending', acesso);
        }
    }

    function onReady(cb) { ready.then(cb); }

    // ================= UI =================
    function injectStyles() {
        if (document.getElementById('frota-auth-styles')) return;
        const css = `
        #frota-auth-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;
            justify-content:center;background:#F5F5F5;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;padding:20px;}
        #frota-auth-overlay .fa-card{background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(117,25,0,.12);
            padding:40px 36px;max-width:420px;width:100%;text-align:center;}
        #frota-auth-overlay .fa-logo{font-size:1.6rem;font-weight:800;color:#0D0D0D;margin-bottom:4px;letter-spacing:-.5px;}
        #frota-auth-overlay .fa-logo span{color:#FE5009;}
        #frota-auth-overlay .fa-sub{font-size:.9rem;color:#323232;font-weight:600;margin-bottom:28px;}
        #frota-auth-overlay .fa-icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;
            justify-content:center;margin:0 auto 18px;font-size:2rem;}
        #frota-auth-overlay .fa-icon.pending{background:#FFF0EB;color:#FE5009;}
        #frota-auth-overlay .fa-title{font-size:1.25rem;font-weight:700;color:#0D0D0D;margin-bottom:10px;}
        #frota-auth-overlay .fa-text{font-size:.92rem;color:#323232;line-height:1.5;margin-bottom:8px;}
        #frota-auth-overlay .fa-email{font-size:.85rem;color:#751900;font-weight:600;background:#FFF0EB;
            border-radius:8px;padding:6px 12px;display:inline-block;margin:6px 0 22px;}
        #frota-btn-google{display:inline-flex;align-items:center;justify-content:center;gap:12px;width:100%;
            padding:13px 18px;border:1.5px solid #e2e2e2;border-radius:10px;background:#fff;color:#0D0D0D;
            font-size:1rem;font-weight:600;cursor:pointer;transition:.15s;}
        #frota-btn-google:hover{border-color:#FE5009;background:#FFF7F4;}
        #frota-btn-google:disabled{opacity:.6;cursor:default;}
        #frota-btn-google.is-loading{color:transparent;position:relative;}
        #frota-btn-google.is-loading::after{content:'';position:absolute;width:20px;height:20px;border:2.5px solid #FE5009;
            border-top-color:transparent;border-radius:50%;animation:fa-spin .7s linear infinite;}
        .fa-btn-sec{display:inline-flex;align-items:center;gap:8px;justify-content:center;padding:11px 18px;border-radius:10px;
            border:none;cursor:pointer;font-size:.92rem;font-weight:600;transition:.15s;}
        .fa-btn-sec.ghost{background:#f3f4f6;color:#323232;}
        .fa-btn-sec.ghost:hover{background:#e8e8e8;}
        .fa-btn-sec.orange{background:#FE5009;color:#fff;}
        .fa-btn-sec.orange:hover{background:#751900;}
        .fa-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
        @keyframes fa-spin{to{transform:rotate(360deg);}}
        /* Chip de usuário */
        #frota-user-chip{position:fixed;top:14px;right:16px;z-index:9000;display:flex;align-items:center;gap:10px;
            background:#fff;border:1px solid #eee;border-radius:999px;padding:5px 6px 5px 14px;
            box-shadow:0 4px 14px rgba(0,0,0,.08);font-family:'Segoe UI',system-ui,sans-serif;}
        #frota-user-chip .fu-name{font-size:.82rem;font-weight:600;color:#0D0D0D;max-width:180px;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        #frota-user-chip .fu-badge{font-size:.62rem;font-weight:700;color:#FE5009;background:#FFF0EB;
            border-radius:6px;padding:1px 6px;text-transform:uppercase;letter-spacing:.5px;}
        #frota-user-chip button{border:none;background:#f3f4f6;color:#751900;border-radius:999px;width:30px;height:30px;
            cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:.15s;}
        #frota-user-chip button:hover{background:#FFF0EB;}
        /* Card de solicitações (admin) */
        #frota-admin-card{background:#fff;border:1px solid #FFE0D3;border-left:4px solid #FE5009;border-radius:12px;
            padding:18px 20px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,.04);}
        #frota-admin-card h3{margin:0 0 4px;font-size:1.05rem;color:#0D0D0D;display:flex;align-items:center;gap:8px;}
        #frota-admin-card .fa-hint{font-size:.82rem;color:#666;margin:0 0 14px;}
        #frota-admin-card .fa-req{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
            padding:10px 0;border-top:1px solid #f2f2f2;}
        #frota-admin-card .fa-req .fa-who{display:flex;flex-direction:column;}
        #frota-admin-card .fa-req .fa-who b{font-size:.9rem;color:#0D0D0D;}
        #frota-admin-card .fa-req .fa-who small{font-size:.78rem;color:#666;}
        #frota-admin-card .fa-req .fa-req-actions{display:flex;gap:8px;}
        #frota-admin-card .fa-req button{border:none;border-radius:8px;padding:7px 14px;font-size:.83rem;font-weight:600;cursor:pointer;transition:.15s;}
        #frota-admin-card .fa-approve{background:#FE5009;color:#fff;} #frota-admin-card .fa-approve:hover{background:#751900;}
        #frota-admin-card .fa-reject{background:#f3f4f6;color:#751900;} #frota-admin-card .fa-reject:hover{background:#FFF0EB;}
        `;
        const style = document.createElement('style');
        style.id = 'frota-auth-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function ensureOverlay() {
        let ov = document.getElementById('frota-auth-overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'frota-auth-overlay';
            document.body.appendChild(ov);
        }
        return ov;
    }
    function removeOverlay() {
        const ov = document.getElementById('frota-auth-overlay');
        if (ov) ov.remove();
    }

    function showOverlay(kind, acesso) {
        const ov = ensureOverlay();
        if (kind === 'checking') {
            ov.innerHTML = `<div class="fa-card">
                <div class="fa-logo"><span>Young</span> Empreendimentos</div>
                <div class="fa-sub">Controle de Frota</div>
                <div class="fa-icon pending"><i class="ph ph-spinner"></i></div>
                <div class="fa-text">Verificando acesso…</div>
            </div>`;
        } else if (kind === 'login') {
            ov.innerHTML = `<div class="fa-card">
                <div class="fa-logo"><span>Young</span> Empreendimentos</div>
                <div class="fa-sub">Controle de Frota</div>
                <div class="fa-title">Bem-vindo(a)</div>
                <div class="fa-text">Entre com sua conta Google da Young para continuar.</div>
                <div style="height:18px;"></div>
                <button id="frota-btn-google" type="button">
                    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    Entrar com Google
                </button>
            </div>`;
            const btn = document.getElementById('frota-btn-google');
            if (btn) btn.addEventListener('click', signInWithGoogle);
        } else if (kind === 'pending') {
            const email = (acesso && acesso.email) || (state.user && state.user.email) || '';
            ov.innerHTML = `<div class="fa-card">
                <div class="fa-logo"><span>Young</span> Empreendimentos</div>
                <div class="fa-sub">Controle de Frota</div>
                <div class="fa-icon pending"><i class="ph ph-hourglass-medium"></i></div>
                <div class="fa-title">Acesso pendente</div>
                <div class="fa-text">Sua solicitação de acesso foi registrada e está aguardando aprovação de um administrador.</div>
                ${email ? `<div class="fa-email">${email}</div>` : '<div style="height:14px;"></div>'}
                <div class="fa-actions">
                    <button class="fa-btn-sec orange" type="button" id="frota-btn-recheck"><i class="ph ph-arrow-clockwise"></i> Já fui aprovado(a)</button>
                    <button class="fa-btn-sec ghost" type="button" id="frota-btn-logout"><i class="ph ph-sign-out"></i> Sair</button>
                </div>
            </div>`;
            const rc = document.getElementById('frota-btn-recheck');
            const lo = document.getElementById('frota-btn-logout');
            if (rc) rc.addEventListener('click', () => window.location.reload());
            if (lo) lo.addEventListener('click', signOut);
        }
    }

    function injectUserChip(acesso) {
        if (document.getElementById('frota-user-chip')) return;
        const nome = (acesso && acesso.full_name) || (acesso && acesso.email) ||
                     (state.user && (state.user.user_metadata?.full_name || state.user.email)) || 'Usuário';
        const chip = document.createElement('div');
        chip.id = 'frota-user-chip';
        chip.innerHTML = `
            <span class="fu-name">${nome}</span>
            ${state.isAdmin ? '<span class="fu-badge">admin</span>' : ''}
            <button type="button" title="Sair" id="frota-chip-logout"><i class="ph ph-sign-out"></i></button>
        `;
        document.body.appendChild(chip);
        const b = document.getElementById('frota-chip-logout');
        if (b) b.addEventListener('click', signOut);
    }

    // ---------------- Card de aprovação (admins, na home) ----------------
    async function renderAdminCard() {
        // Só na home (dashboard). Detecta pela presença do KPI total.
        if (!document.getElementById('kpiTotal')) return;
        const main = document.querySelector('.main-content');
        if (!main) return;

        let card = document.getElementById('frota-admin-card');
        if (!card) {
            card = document.createElement('div');
            card.id = 'frota-admin-card';
            main.insertBefore(card, main.firstChild);
        }

        let pendentes = [];
        try {
            const { data, error } = await sb
                .schema('frota')
                .from('frota_solicitacao_acesso')
                .select('id,email,full_name,requested_at')
                .eq('status', 'pending')
                .order('requested_at', { ascending: true });
            if (error) throw error;
            pendentes = data || [];
        } catch (e) {
            console.error('[FrotaAuth] erro ao listar solicitações:', e);
        }

        if (pendentes.length === 0) { card.remove(); return; }

        const rows = pendentes.map((s) => {
            const nome = s.full_name || (s.email ? s.email.split('@')[0] : 'Usuário');
            return `<div class="fa-req" data-id="${s.id}">
                <div class="fa-who"><b>${nome}</b><small>${s.email || ''}</small></div>
                <div class="fa-req-actions">
                    <button class="fa-approve" data-act="approve" data-id="${s.id}"><i class="ph ph-check"></i> Aprovar</button>
                    <button class="fa-reject" data-act="reject" data-id="${s.id}"><i class="ph ph-x"></i> Recusar</button>
                </div>
            </div>`;
        }).join('');

        card.innerHTML = `
            <h3><i class="ph ph-user-plus" style="color:#FE5009;"></i> Solicitações de acesso
                <span style="font-size:.8rem;background:#FFF0EB;color:#FE5009;border-radius:8px;padding:1px 8px;">${pendentes.length}</span>
            </h3>
            <p class="fa-hint">Pessoas que entraram com Google e aguardam liberação. Aprovar concede acesso de administrador.</p>
            ${rows}
        `;

        card.querySelectorAll('button[data-act]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const act = btn.getAttribute('data-act');
                btn.disabled = true;
                try {
                    if (act === 'approve') {
                        const { error } = await sb.rpc('frota_aprovar_solicitacao', { p_id: id });
                        if (error) throw error;
                        toast('Acesso aprovado.', 'success');
                    } else {
                        const { error } = await sb.rpc('frota_recusar_solicitacao', { p_id: id });
                        if (error) throw error;
                        toast('Solicitação recusada.', 'info');
                    }
                    await renderAdminCard();
                } catch (e) {
                    btn.disabled = false;
                    toast('Erro: ' + (e.message || e), 'error');
                }
            });
        });
    }

    function toast(msg, type) {
        if (window.Utils && Utils.showToast) Utils.showToast(msg, type);
        else alert(msg);
    }

    // ---------------- Arranque ----------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', guard);
    } else {
        guard();
    }

    return {
        signInWithGoogle,
        signOut,
        onReady,
        client: sb,
        isAdmin: () => state.isAdmin,
        user: () => state.user
    };
})();

window.FrotaAuth = FrotaAuth;

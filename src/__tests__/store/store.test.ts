import { describe, test, expect, beforeEach } from "bun:test";
import { proxy, snapshot } from "valtio";

// Test store logic independently (without Electrobun IPC)
interface Provider {
	id: string;
	name: string;
	cli: "claude" | "codex" | "gemini";
	apiKey: string;
	baseUrl?: string;
	model?: string;
	isActive: boolean;
	createdAt: number;
}

function createTestStore() {
	const store = proxy({
		activeCLI: "claude" as "claude" | "codex" | "gemini",
		view: "providers" as "providers" | "add-provider" | "edit-provider",
		editingProvider: null as Provider | null,
		providers: [] as Provider[],
		loading: false,
	});

	const actions = {
		selectCLI(cli: "claude" | "codex" | "gemini") {
			store.activeCLI = cli;
			store.view = "providers";
			store.editingProvider = null;
		},
		showAddProvider() {
			store.editingProvider = null;
			store.view = "add-provider";
		},
		showEditProvider(provider: Provider) {
			store.editingProvider = provider;
			store.view = "edit-provider";
		},
		backToList() {
			store.editingProvider = null;
			store.view = "providers";
		},
		saveProvider(provider: Omit<Provider, "createdAt">) {
			const p: Provider = { ...provider, createdAt: Date.now() };
			const idx = store.providers.findIndex((x) => x.id === p.id);
			if (idx >= 0) {
				store.providers[idx] = p;
			} else {
				store.providers.unshift(p);
			}
			store.view = "providers";
			store.editingProvider = null;
		},
		deleteProvider(id: string) {
			store.providers = store.providers.filter((p) => p.id !== id);
		},
		activateProvider(cli: string, id: string) {
			store.providers = store.providers.map((p) =>
				p.cli === cli ? { ...p, isActive: p.id === id } : p
			);
		},
	};

	return { store, actions };
}

describe("Store actions", () => {
	let store: ReturnType<typeof createTestStore>["store"];
	let actions: ReturnType<typeof createTestStore>["actions"];

	beforeEach(() => {
		const s = createTestStore();
		store = s.store;
		actions = s.actions;
	});

	test("initial state", () => {
		const snap = snapshot(store);
		expect(snap.activeCLI).toBe("claude");
		expect(snap.view).toBe("providers");
		expect(snap.editingProvider).toBeNull();
		expect(snap.providers).toHaveLength(0);
	});

	test("selectCLI changes active CLI and resets view", () => {
		store.view = "add-provider";
		actions.selectCLI("codex");

		const snap = snapshot(store);
		expect(snap.activeCLI).toBe("codex");
		expect(snap.view).toBe("providers");
		expect(snap.editingProvider).toBeNull();
	});

	test("showAddProvider sets view", () => {
		actions.showAddProvider();
		expect(snapshot(store).view).toBe("add-provider");
		expect(snapshot(store).editingProvider).toBeNull();
	});

	test("showEditProvider sets provider and view", () => {
		const provider: Provider = {
			id: "p1", name: "Test", cli: "claude", apiKey: "sk-test",
			isActive: false, createdAt: Date.now(),
		};
		actions.showEditProvider(provider);

		const snap = snapshot(store);
		expect(snap.view).toBe("edit-provider");
		expect(snap.editingProvider?.id).toBe("p1");
	});

	test("backToList resets view and editing", () => {
		actions.showAddProvider();
		actions.backToList();

		const snap = snapshot(store);
		expect(snap.view).toBe("providers");
		expect(snap.editingProvider).toBeNull();
	});

	test("saveProvider adds new provider", () => {
		actions.saveProvider({
			id: "p1", name: "New", cli: "claude", apiKey: "sk-new", isActive: false,
		});

		const snap = snapshot(store);
		expect(snap.providers).toHaveLength(1);
		expect(snap.providers[0].name).toBe("New");
		expect(snap.view).toBe("providers");
	});

	test("saveProvider updates existing provider", () => {
		actions.saveProvider({
			id: "p1", name: "Original", cli: "claude", apiKey: "sk-1", isActive: false,
		});
		actions.saveProvider({
			id: "p1", name: "Updated", cli: "claude", apiKey: "sk-2", isActive: false,
		});

		const snap = snapshot(store);
		expect(snap.providers).toHaveLength(1);
		expect(snap.providers[0].name).toBe("Updated");
		expect(snap.providers[0].apiKey).toBe("sk-2");
	});

	test("deleteProvider removes provider", () => {
		actions.saveProvider({ id: "p1", name: "A", cli: "claude", apiKey: "sk-1", isActive: false });
		actions.saveProvider({ id: "p2", name: "B", cli: "claude", apiKey: "sk-2", isActive: false });

		actions.deleteProvider("p1");
		const snap = snapshot(store);
		expect(snap.providers).toHaveLength(1);
		expect(snap.providers[0].id).toBe("p2");
	});

	test("activateProvider activates one and deactivates others for same CLI", () => {
		actions.saveProvider({ id: "p1", name: "A", cli: "claude", apiKey: "sk-1", isActive: true });
		actions.saveProvider({ id: "p2", name: "B", cli: "claude", apiKey: "sk-2", isActive: false });
		actions.saveProvider({ id: "p3", name: "C", cli: "codex", apiKey: "sk-3", isActive: true });

		actions.activateProvider("claude", "p2");

		const snap = snapshot(store);
		const p1 = snap.providers.find((p) => p.id === "p1");
		const p2 = snap.providers.find((p) => p.id === "p2");
		const p3 = snap.providers.find((p) => p.id === "p3");

		expect(p1?.isActive).toBe(false);
		expect(p2?.isActive).toBe(true);
		expect(p3?.isActive).toBe(true); // codex untouched
	});

	test("deleteProvider with non-existent id does nothing", () => {
		actions.saveProvider({ id: "p1", name: "A", cli: "claude", apiKey: "sk-1", isActive: false });
		actions.deleteProvider("non-existent");

		expect(snapshot(store).providers).toHaveLength(1);
	});
});

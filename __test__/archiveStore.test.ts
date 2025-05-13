import { useArchiveStore } from "../src/stores/useArchiveStore";

describe("useArchiveStore", () => {
  beforeEach(() => {
    // 重置状态到初始值
    useArchiveStore.setState({ isArchiveOpen: false });
  });

  it("should initialize with isArchiveOpen = false", () => {
    const state = useArchiveStore.getState();
    expect(state.isArchiveOpen).toBe(false);
  });

  it("setArchiveOpen should update isArchiveOpen to true", () => {
    const { setArchiveOpen } = useArchiveStore.getState();
    setArchiveOpen(true);
    expect(useArchiveStore.getState().isArchiveOpen).toBe(true);
  });

  it("setArchiveOpen should update isArchiveOpen to false", () => {
    // 先设为 true
    useArchiveStore.setState({ isArchiveOpen: true });
    const { setArchiveOpen } = useArchiveStore.getState();
    setArchiveOpen(false);
    expect(useArchiveStore.getState().isArchiveOpen).toBe(false);
  });
});

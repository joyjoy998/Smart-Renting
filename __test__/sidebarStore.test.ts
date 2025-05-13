// __tests__/sidebarStore.test.ts
import { useSidebarStore } from "../src/stores/useSidebarStore";

describe("useSidebarStore", () => {
  beforeEach(() => {
    // Reset the store state to default
    useSidebarStore.setState({ isOpen: false });
  });

  it("should initialize isOpen as false", () => {
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it("setOpen should update isOpen to true", () => {
    const { setOpen } = useSidebarStore.getState();
    setOpen(true);
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it("setOpen should update isOpen to false", () => {
    // Start from open state
    useSidebarStore.setState({ isOpen: true });
    const { setOpen } = useSidebarStore.getState();
    setOpen(false);
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });
});

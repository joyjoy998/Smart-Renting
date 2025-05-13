// __tests__/settingsBudgetStore.test.ts
import {
  useSettingsStore,
  useBudgetStore,
} from "../src/stores/useSettingsStore";

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Reset state
    useSettingsStore.setState({ isOpen: false });
  });

  it("should initialize isOpen as false", () => {
    expect(useSettingsStore.getState().isOpen).toBe(false);
  });

  it("setOpen should update isOpen", () => {
    const { setOpen } = useSettingsStore.getState();
    setOpen(true);
    expect(useSettingsStore.getState().isOpen).toBe(true);
    setOpen(false);
    expect(useSettingsStore.getState().isOpen).toBe(false);
  });
});

describe("useBudgetStore", () => {
  beforeEach(() => {
    // Reset state
    useBudgetStore.setState({ minPrice: 200, maxPrice: 600 });
  });

  it("should initialize with default min and max prices", () => {
    const { minPrice, maxPrice } = useBudgetStore.getState();
    expect(minPrice).toBe(200);
    expect(maxPrice).toBe(600);
  });

  it("setMinPrice should update minPrice without affecting maxPrice", () => {
    const { setMinPrice } = useBudgetStore.getState();
    setMinPrice(300);
    const state = useBudgetStore.getState();
    expect(state.minPrice).toBe(300);
    expect(state.maxPrice).toBe(600);
  });

  it("setMaxPrice should update maxPrice without affecting minPrice", () => {
    const { setMaxPrice } = useBudgetStore.getState();
    setMaxPrice(800);
    const state = useBudgetStore.getState();
    expect(state.maxPrice).toBe(800);
    expect(state.minPrice).toBe(200);
  });
});

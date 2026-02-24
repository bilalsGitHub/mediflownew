import consultationsReducer, {
  setConsultations,
  setConsultation,
  addConsultation,
  removeConsultation,
  setSelectedConsultationId,
  clearConsultations,
  selectConsultationsList,
  selectSelectedConsultationId,
  selectConsultationById,
} from "@/store/slices/data/consultationsSlice";
import type { Consultation } from "@/lib/storage";

const mockConsultation: Consultation = {
  id: "c1",
  patientName: "Patient A",
  transcript: "Hello",
  status: "draft",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockConsultation2: Consultation = {
  id: "c2",
  patientName: "Patient B",
  status: "not_transferred",
  createdAt: "2024-01-02T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
};

describe("consultationsSlice", () => {
  const initialState = {
    list: [],
    selectedId: null,
    lastFetchedAt: null,
    isLoading: false,
    error: null,
  };

  it("should return initial state", () => {
    expect(
      consultationsReducer(undefined, { type: "unknown" })
    ).toEqual(initialState);
  });

  it("setConsultations sets list and lastFetchedAt", () => {
    const state = consultationsReducer(
      initialState,
      setConsultations([mockConsultation, mockConsultation2])
    );
    expect(state.list).toHaveLength(2);
    expect(state.list[0].id).toBe("c1");
    expect(state.lastFetchedAt).toBeGreaterThan(0);
    expect(state.error).toBeNull();
  });

  it("setConsultation updates existing or adds new", () => {
    const withList = consultationsReducer(
      initialState,
      setConsultations([mockConsultation])
    );
    const updated = consultationsReducer(
      withList,
      setConsultation({ ...mockConsultation, patientName: "Updated A" })
    );
    expect(updated.list[0].patientName).toBe("Updated A");

    const added = consultationsReducer(
      withList,
      setConsultation(mockConsultation2)
    );
    expect(added.list).toHaveLength(2);
    expect(added.list.some((c) => c.id === "c2")).toBe(true);
  });

  it("addConsultation appends if id not present", () => {
    const state = consultationsReducer(
      { ...initialState, list: [mockConsultation] },
      addConsultation(mockConsultation2)
    );
    expect(state.list).toHaveLength(2);
  });

  it("addConsultation does not duplicate same id", () => {
    const state = consultationsReducer(
      { ...initialState, list: [mockConsultation] },
      addConsultation(mockConsultation)
    );
    expect(state.list).toHaveLength(1);
  });

  it("removeConsultation removes by id and clears selectedId if same", () => {
    const withList = consultationsReducer(
      initialState,
      setConsultations([mockConsultation, mockConsultation2])
    );
    const withSelected = consultationsReducer(
      withList,
      setSelectedConsultationId("c1")
    );
    const state = consultationsReducer(withSelected, removeConsultation("c1"));
    expect(state.list).toHaveLength(1);
    expect(state.list[0].id).toBe("c2");
    expect(state.selectedId).toBeNull();
  });

  it("clearConsultations resets list and selectedId", () => {
    const state = consultationsReducer(
      {
        ...initialState,
        list: [mockConsultation],
        selectedId: "c1",
        lastFetchedAt: 1,
        error: "err",
      },
      clearConsultations()
    );
    expect(state.list).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.lastFetchedAt).toBeNull();
    expect(state.error).toBeNull();
  });

  describe("selectors", () => {
    it("selectConsultationsList returns list", () => {
      const list = [mockConsultation];
      expect(
        selectConsultationsList({ consultations: { ...initialState, list } })
      ).toEqual(list);
    });
    it("selectSelectedConsultationId returns selectedId", () => {
      expect(
        selectSelectedConsultationId({
          consultations: { ...initialState, selectedId: "c1" },
        })
      ).toBe("c1");
    });
    it("selectConsultationById returns consultation or null", () => {
      const list = [mockConsultation];
      const state = { consultations: { ...initialState, list } };
      expect(selectConsultationById("c1")(state)).toEqual(mockConsultation);
      expect(selectConsultationById("c99")(state)).toBeNull();
    });
  });
});

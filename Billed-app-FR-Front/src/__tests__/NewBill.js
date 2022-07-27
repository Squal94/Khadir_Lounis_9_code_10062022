/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

// Nouvel Import
import BillsUI from "../views/BillsUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store.js", () => mockStore);
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then NewBill Page was correctly open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;

      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy;
      expect(screen.getByText("Type de dépense")).toBeTruthy;
      expect(screen.getByTestId("expense-type")).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then click on submit ok", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newNewBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newNewBill.handleSubmit);
      const submitNewBill = screen.getByTestId("form-new-bill");

      submitNewBill.addEventListener("click", handleSubmit);
      userEvent.click(submitNewBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then i upload a new image bill (.jpg)", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const newNewBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn((e) => newNewBill.handleChangeFile(e));
      const newBillsfile = screen.getByTestId("file");
      const alertExtension = screen.getByTestId("alertExtension");
      const file = new File(["picture"], "test.jpg", { type: "image/jpg" });

      newBillsfile.addEventListener("change", handleChangeFile);
      fireEvent.input(newBillsfile, file);

      expect(file.name).toContain("jpg");
      expect(alertExtension.textContent).toBe("");
    });

    test("Then i upload a new image bill not (jpg,png,jpeg)", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newNewBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn((e) => newNewBill.handleChangeFile(e));
      const newBillsfile = screen.getByTestId("file");
      const file = new File(["texte"], "test.txt", { type: "texte/txt" });
      const alertExtension = screen.getByTestId("alertExtension");

      newBillsfile.addEventListener("input", handleChangeFile);
      fireEvent.input(newBillsfile, file);

      expect(file.name).not.toContain("jpg");
      expect(alertExtension.textContent).toBe(
        "Le fichier selectionné doit avoir l'extension png, jpg, jpeg"
      );
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("send new bill from mock API Post", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      document.body.innerHTML = NewBillUI();

      const newNewBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const btnBill = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newNewBill.handleSubmit);

      btnBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(btnBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");

        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const error404Page = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = error404Page;
        const verificationUrl404 = await waitFor(() =>
          screen.getByText(/Erreur 404/)
        );
        expect(verificationUrl404).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const error500Page = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = error500Page;
        const verificationUrl500 = await waitFor(() =>
          screen.getByText(/Erreur 500/)
        );
        expect(verificationUrl500).toBeTruthy();
      });
    });
  });
});

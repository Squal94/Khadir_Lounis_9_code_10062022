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
// Verification de la bonne ouverture de la page Newbill
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
    test("when I upload a new image bill with valide extension", () => {
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
      // Génération du nouveau fichier
      const file = new File(["picture"], "test.jpg", { type: "image/jpg" });
      //Attribution d'un événement a la function simuler par jest "handleChangeFile"
      newBillsfile.addEventListener("change", handleChangeFile);
      // Attribution du nouveau fichier a l'input récupéré par newBillsfile
      fireEvent.input(newBillsfile, file);

      expect(file.name).toContain("jpg");
      //Vérification que l'alerte ne se declanche pas quand un fichier avec la bonne extension est utilisé
      expect(alertExtension.textContent).toBe("");
    });

    test("when I upload a new image bill with wrong extension", () => {
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
      //Vérification que l'alerte se declanche quand un fichier avec la mauvaise extension est utilisé
      expect(alertExtension.textContent).toBe(
        "Le fichier selectionné doit avoir l'extension png, jpg, jpeg"
      );
    });
  });
});

// Test integration Post

describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("Then send new bill from mock API", async () => {
      // Je teste le Post en vérifient que les données sont bien envoyées grace à handleSubmit .
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
    describe("When an API generates an error", () => {
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

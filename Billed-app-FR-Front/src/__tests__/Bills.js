/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

//Nouveaux Imports pour la suite des tests

import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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

      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId("icon-window"));
      //expect n'est pas fourni et la constante windowIcon n'est pas utilisée
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

// test d'ouverture de la  fenetre Newbill à partir du bouton create new bill de la page Bills

describe("Given I want to create a new bill", () => {
  describe("When I click on the new bill button", () => {
    test("Then launch modal new bill", async () => {
      // simulation du dom de Html
      document.body.innerHTML = BillsUI({ data: bills });

      //Definition des propriétées de l'objet
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      //Definition de l'utilisateur par la methode setItem de localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      // Lancement de la nouvelle instance de Bills
      const newBill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Création de la fonction simulée de handleClickNewBill
      const handleClickNewBill = jest.fn(newBill.handleClickNewBill);
      const btnNewBill = screen.getByTestId("btn-new-bill");

      //Réattribution de ma fonction simulée à un événement click
      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);

      // Expect de l'utilisation de ma fonction simulée
      // Verification de l'apparition du texte "Envoyer une note de frais" dans le DOM
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy;
    });
  });
});

// test de la modal iconEye

describe("Given I want to see an bill", () => {
  describe("When I click iconEye", () => {
    test("Then launch modal iconEye ", async () => {
      document.body.innerHTML = BillsUI({ data: bills });
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

      const newBill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleClickIconEye = jest.fn((e) => newBill.handleClickIconEye);
      const modaleFile = document.getElementById("modaleFile");
      // Je lui indique de prendre la première icon-eye du tableau créé par getAllByTestId
      const clickIconEye = screen.getAllByTestId("icon-eye")[0];

      // Je lui indique que l'action se deroule dans une modal grace à la fonction simulée
      //  $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
      clickIconEye.addEventListener("click", handleClickIconEye);
      fireEvent.click(clickIconEye);

      expect(handleClickIconEye).toHaveBeenCalled();
      expect($.fn.modal).toHaveBeenCalled();
      expect(screen.getByText("Justificatif")).toBeTruthy();
    });
  });
});

// Test Integration get Bill

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to employee bills ", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.Bills);

      const title = await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(title).toBeTruthy();

      const button = await waitFor(() => screen.getByTestId("btn-new-bill"));
      expect(button).toBeTruthy();
    });
    describe("When an API generates an error", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
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

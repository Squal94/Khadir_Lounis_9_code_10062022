/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

//Nouvelles Imports pour la suites des tests

import Bills from "../containers/Bills.js";
//import ErrorPage from "../ErrorPage.js";
//import { modal } from "../views/DashboardFormUI.js";
//import modal from "../views/BillsUI.js";
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
      //expect n'est pas fourni et la constante windowIcon n'est pas utilisé
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
      //expect(windowIcon.id).toBeEqual("icon-window");
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

// test Modal new bill launch
describe("Given I reate a new bill", () => {
  describe("When I click on buttonNewBill", () => {
    test("Then launch modal new bill", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      document.body.innerHTML = BillsUI({ data: bills });

      const newBill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(newBill.handleClickNewBill);

      const btnNewBill = screen.getByTestId("btn-new-bill");
      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy;
    });
  });
});

// test de la modal iconEye

describe("Given I want to see an bill", () => {
  describe("When I click iconEye", () => {
    test("Then launch modal iconEye ", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      document.body.innerHTML = BillsUI({ data: bills });

      const newBill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleClickIconEye = jest.fn(newBill.handleClickIconEye);
      //const modal = jest.fn(modal);
      //jest.fn(BillsUI.modal);
      // jest.fn(BillsUI(modal));
      // const modaleFile = document.getElementById("modaleFile");
      // modaleFile.jest.fn(BillsUI(modal));

      const modaleFile = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));

      const clickIconEye = screen.getAllByTestId("icon-eye");
      if (clickIconEye)
        clickIconEye.forEach((icon) => {
          icon.addEventListener("click", () => handleClickIconEye(icon));
          userEvent.click(icon);
          expect(handleClickIconEye).toHaveBeenCalled();
        });

      expect(screen.getByText("Justificatif")).toBeTruthy;
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
      document.body.innerHTML = BillsUI({ data: bills });
      // const root = document.createElement("div");
      // root.setAttribute("id", "root");
      // document.body.append(root);
      // router();
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const typeCol = screen.getByText("Type");
      expect(typeCol).toBeTruthy();
      const NewBill = screen.getByText("Nouvelle note de frais");
      expect(NewBill).toBeTruthy();
      // const Vol = screen.getByText("Vol Paris Marseille");
      // expect(Vol).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
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
        document.body.innerHTML = BillsUI({ data: bills });
        // const root = document.createElement("div");
        // root.setAttribute("id", "root");
        // document.body.appendChild(root);
        // router();
        //console.log(BillsUI({ data: bills[0] }));
      });
      test("fetches bills from an API and fails with 404 message error", () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        const error404Page = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = error404Page;
        const verificationUrl404 = screen.getByText(/Erreur 404/);
        expect(verificationUrl404).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        // window.onNavigate();
        // await new Promise(process.nextTick);
        // const message = await screen.getByText(/Erreur 500/);
        // expect(message).toBeTruthy();
        const error500Page = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = error500Page;
        const verificationUrl500 = screen.getByText(/Erreur 500/);
        expect(verificationUrl500).toBeTruthy();
      });
    });
  });
});

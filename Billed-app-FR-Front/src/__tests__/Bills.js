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

// test de click handleClickNewBill

// describe("Given I reate a new bill", () => {
//   describe("When I click on buttonNewBill", () => {
//     test("Then launch function handleClickNewBill", async () => {
//       const btnBills = document.createElement("button");
//       btnBills.setAttribute("data-testid", "btn-new-bill");
//       document.body.append(btnBills);

//       btnBills.click;

//       new Bills({
//         document,
//         onNavigate,
//         store: null,
//         localStorage,
//       });

//       expect(handleClickNewBill).toHaveBeenCalled();
//       //expect(handleClickIconEye()).toHaveBeenCalled();
//     });
//   });
// });

describe("Given I reate a new bill", () => {
  describe("When I click on buttonNewBill", () => {
    test("Then launch function handleClickNewBill", async () => {
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

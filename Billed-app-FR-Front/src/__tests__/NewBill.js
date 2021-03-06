/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

// Nouvel Import
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";
import { bills } from "../fixtures/bills.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
//jest.mock("../__mocks__/store.js", () => mockStore);
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
      //const btnEnvoyer = document.querySelector("btn-send-bill");

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
      // beforeEach(() => {
      //   jest.spyOn(mockStore, "bills");
      // });
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // const html = NewBillUI();
      // document.body.innerHTML = html;
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
      const newBillsfile = document.querySelector(`input[data-testid="file"]`);
      const handleChangeFile = jest.fn((e) => newNewBill.handleChangeFile(e));
      // const newBillsfile = screen.getByTestId("file");

      newBillsfile.addEventListener("change", handleChangeFile);

      // const file = new File(["picture"], "test.jpg");

      fireEvent.change(newBillsfile, {
        target: {
          value: [new File([], "test.jpg", { type: "image/jpg" })],
        },
      });
      const alertExtension = screen.getByTestId("alertExtension");

      expect(handleChangeFile).toHaveBeenCalled();
      //alertExtension.innerHTML = "";
      expect(alertExtension.textContent).toBe("");
    });
    test("Then i upload a new image bill not (jpg,png,jpeg)", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
      });
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
      const alertExtension = screen.getByTestId("alertExtension");
      const file = new File(["texte"], "test.txt");
      newBillsfile.addEventListener("click", handleChangeFile);
      userEvent.click(newBillsfile);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.name).not.toContain("jpg");
      expect(alertExtension.textContent).toBe(
        "Le fichier selectionné doit avoir l'extension png, jpg, jpeg"
      );
    });
  });
});

// Test de fonctionnement spy et lecture mock file

// describe("Test de fonctionnement", () => {
//   describe("Test liée au import", () => {
//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills");
//     });
//     test("mockStore", () => {
//       mockStore
//         .bills()
//         .list()
//         .then((r) => {
//           expect(r[0].id).toEqual("47qAXb6fIm2zOKkLzMro");
//         });
//     });
//   });
// });

// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then i upload a new image bill", () => {
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );
//       const html = NewBillUI();
//       document.body.innerHTML = html;

//       const newNewBill = new NewBill({
//         document,
//         onNavigate,
//         store: null,
//         localStorage: window.localStorage,
//       });
//       const handleChangeFile = jest.fn(newNewBill.handleChangeFile);
//       handleChangeFile.mockReturnValue("test.jpg");

//       // const handleChangeFile = jest
//       //   .fn(newNewBill.handleChangeFile)
//       //   .mockResolvedValueOnce("test.jpg")
//       //   .mockResolvedValueOnce("test.jpeg")
//       //   .mockResolvedValueOnce("test.png");

//       // const file = document.querySelector(`input[data-testid="file"]`);
//       // file.addEventListener("change", handleChangeFile);
//       // const file = document.getByTestId(`input[data-testid="file"]`);
//       // file.addEventListener("change", handleChangeFile);

//       //file.textContent = "test.jpg";
//       // userEvent.click(file);

//       const file = screen.getByTestId("file");
//       file.addEventListener("change", handleChangeFile);
//       fireEvent.change(file);
//       expect(handleChangeFile).toHaveBeenCalled();
//       // test jpg
//       handleChangeFile.mockReturnValue("test.jpg");
//       expect(handleChangeFile()).toContain("jpg");
//       // test n'est pas format image
//       handleChangeFile.mockReturnValue("test.pdf");
//       expect(handleChangeFile()).not.toContain("jpg");
//     });
//   });
// });

//exemple bill test

// describe("Given I reate a new bill", () => {
//   describe("When I click on buttonNewBill", () => {
//     test("Then launch modal new bill", async () => {
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       document.body.innerHTML = BillsUI({ data: bills });

//       const newBill = new Bills({
//         document,
//         onNavigate,
//         store: null,
//         localStorage: window.localStorage,
//       });

//       const handleClickNewBill = jest.fn(newBill.handleClickNewBill);

//       const btnNewBill = screen.getByTestId("btn-new-bill");
//       btnNewBill.addEventListener("click", handleClickNewBill);
//       userEvent.click(btnNewBill);

//       expect(handleClickNewBill).toHaveBeenCalled();
//       expect(screen.getByText("Envoyer une note de frais")).toBeTruthy;
//     });
//   });
// });

// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then i upload a new image bill (.jpg)", () => {
//       beforeEach(() => {
//         jest.spyOn(mockStore, "bills");
//       });
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );
//       const html = NewBillUI();
//       document.body.innerHTML = html;

//       const newNewBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorage: window.localStorage,
//       });
//       const handleChangeFile = jest.fn((e) => newNewBill.handleChangeFile(e));
//       const newBillsfile = screen.getByTestId("file");
//       const alertExtension = screen.getByTestId("alertExtension");
//       const file = new File(["picture"], "test.jpg");

//       newBillsfile.addEventListener("click", handleChangeFile);
//       userEvent.click(newBillsfile);

//       expect(handleChangeFile).toHaveBeenCalled();
//       expect(file.name).toContain("jpg");
//       alertExtension.innerHTML = "";
//       expect(alertExtension.textContent).toBe("");

//       //console.log(file.name);

//       // exemple mdn
//       //      new File(["foo"], "foo.txt", {
//       // type: "text/plain",

//       //file.innerHTML("test.jpg");

//       // file.addEventListener("change", handleChangeFile);
//       // userEvent.upload(newBillsfile, file);
//       // expect(handleChangeFile).toHaveBeenCalled();

//       // // test jpg
//       // handleChangeFile.mockReturnValue("test.jpg");

//       // // test n'est pas format image
//       // handleChangeFile.mockReturnValue("test.pdf");
//       // expect(handleChangeFile()).not.toContain("jpg");
//     });
//   });
// });

//  test("Then a new bill should be stored in API", async () => {
//    beforeEach(() => {
//      jest.spyOn(mockStore, "bills");
//    });
//    document.body.innerHTML = NewBillUI();

//    const newBill = new NewBill({
//      document,
//      onNavigate,
//      store: mockStore,
//      bills: bills[0],
//      localStorage: window.localStorage,
//    });

//    const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
//    const create = jest.fn(mockStore.bills().create);

//    const bill = await create();

//    expect(create).toHaveBeenCalled();
//    console.log(bill);

// expect(bills.key).toBe("54e4c9f17bdafb5f0f2f");
// expect(bills.vat).toBe("70");
// expect(bills.fileUrl).toBe("https://localhost:3456/images/test.jpg");
// expect(bills.status).toBe("pending");
// expect(bills.type).toBe("Equipement et matériel");
// expect(bills.commentary).toBe(
//   "Achat d'un ordinateur portable pour les déplacements"
// );
// expect(bills.name).toBe("Ordinateur portable");
// expect(bills.fileName).toBe("preview-facture-free-201801-pdf-1.jpg");
// expect(bills.date).toBe("2004-04-04");
// expect(bills.amount).toBe(348);
// expect(bills.commentAdmin).toBe("");
// expect(bills.email).toBe("a@a");
// expect(bills.pct).toBe(20);
//  });

// describe("When I am on NewBill page and I upload a file with jpg, jpeg or png extension", () => {
//   test("Then a new bill should be stored in API", async () => {
//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills");
//     });
//     document.body.innerHTML = NewBillUI();

//     const newBill = new NewBill({
//       document,
//       onNavigate,
//       store: mockStore,
//       bills: bills,
//       localStorage: window.localStorage,
//     });

//     const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
//     const create = jest.fn(mockStore.bills().create);

//     // const fileInput = screen.getByText("Justificatif");
//     // fileInput.addEventListener("change", handleChangeFile);
//     const newBillsfile = screen.getByTestId("file");
//     newBillsfile.addEventListener("change", handleChangeFile);

//     fireEvent.change(newBillsfile, {
//       target: {
//         files: [
//           new File(["test"], "test.jpg", {
//             type: "image/jpeg",
//           }),
//         ],
//       },
//     });

//     expect(handleChangeFile).toBeCalled();

//     const bill = await create();

//     expect(create).toHaveBeenCalled();

//     expect(bill.key).toBe("1234");
//     expect(bill.fileUrl).toBe("https://localhost:3456/images/test.jpg");
//   });
// });

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
//import { bills } from "../fixtures/bills.js";
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
      //   beforeEach(() => {
      //     jest.spyOn(mockStore, "bills");
      //   });
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
      //const newBillsfile = document.querySelector(`input[data-testid="file"]`);
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

// describe("when I click on the submit button", () => {
//   test("the bill should be sent", () => {
//     Object.defineProperty(window, "localStorage", {
//       value: localStorageMock,
//     });
//     window.localStorage.setItem(
//       "user",
//       JSON.stringify({
//         type: "Employee",
//         email: "a@a",
//       })
//     );
//     const root = document.createElement("div");
//     root.setAttribute("id", "root");
//     document.body.append(root);
//     router();

//     document.body.innerHTML = NewBillUI();

//     const expenseType = screen.getByTestId("expense-type");
//     expenseType.value = "Transports";

//     const expenseName = screen.getByTestId("expense-name");
//     expenseName.value = "test1";

//     const expenseAmount = screen.getByTestId("amount");
//     expenseAmount.value = 100;

//     const expenseDate = screen.getByTestId("datepicker");
//     expenseDate.value = "2001-01-01";

//     const expenseVAT = screen.getByTestId("vat");
//     expenseVAT.value = "";

//     const expensePCT = screen.getByTestId("pct");
//     expensePCT.value = 20;

//     const expenseCommentary = screen.getByTestId("commentary");
//     expenseCommentary.value = "plop";

//     const form = screen.getByTestId("form-new-bill");
//     fireEvent.submit(form);

//     expect(form).toBeTruthy();
//     expect(expenseAmount.value).toEqual("100");
//   });
// });

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

// test("Then a new bill should be stored in API", async () => {
//   beforeEach(() => {
//     jest.spyOn(mockStore, "bills");
//   });
//   document.body.innerHTML = NewBillUI();

//   const newBill = new NewBill({
//     document,
//     onNavigate,
//     store: mockStore,
//     bills: bills[0],
//     localStorage: window.localStorage,
//   });

//   const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
//   const create = jest.fn(mockStore.bills().create);

//   const bill = await create();

//   expect(create).toHaveBeenCalled();
//   console.log(bill);

//   expect(bills.key).toBe("54e4c9f17bdafb5f0f2f");
//   expect(bills.vat).toBe("70");
//   expect(bills.fileUrl).toBe("https://localhost:3456/images/test.jpg");
//   expect(bills.status).toBe("pending");
//   expect(bills.type).toBe("Equipement et matériel");
//   expect(bills.commentary).toBe(
//     "Achat d'un ordinateur portable pour les déplacements"
//   );
//   expect(bills.name).toBe("Ordinateur portable");
//   expect(bills.fileName).toBe("preview-facture-free-201801-pdf-1.jpg");
//   expect(bills.date).toBe("2004-04-04");
//   expect(bills.amount).toBe(348);
//   expect(bills.commentAdmin).toBe("");
//   expect(bills.email).toBe("a@a");
//   expect(bills.pct).toBe(20);
// });

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

//  test("Then i upload a new image bill (.jpg)", () => {
//       //   beforeEach(() => {
//       //     jest.spyOn(mockStore, "bills");
//       //   });
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );
//       // const html = NewBillUI();
//       // document.body.innerHTML = html;
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.NewBill);

//       const newNewBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorage: window.localStorage,
//       });
//       //const newBillsfile = document.querySelector(`input[data-testid="file"]`);
//       const handleChangeFile = jest.fn((e) => newNewBill.handleChangeFile(e));
//       const newBillsfile = screen.getByTestId("file");
//       const alertExtension = screen.getByTestId("alertExtension");
//       const file = new File(["picture"], "test.jpg", { type: "image/jpg" });
//       newBillsfile.addEventListener("change", handleChangeFile);
//       fireEvent.input(newBillsfile, file.name);

//       expect(handleChangeFile).toHaveBeenCalled();
//       expect(file.name).toContain("jpg");
//       expect(alertExtension.textContent).toBe("");

//   fireEvent.change(newBillsfile, {
//     target: {
//       value: [new File(["file"], "test.jpg", { type: "image/jpg" })],
//     },
//   });
//    const file = new File(["foo"], "foo.txt", {
//      type: "text/plain",
//    });
//alertExtension.innerHTML = "";
// });
// test("Then i upload a new image bill (jpg)", () => {
//   beforeEach(() => {
//     jest.spyOn(mockStore, "bills");
//   });
//   Object.defineProperty(window, "localStorage", {
//     value: localStorageMock,
//   });
//   window.localStorage.setItem(
//     "user",
//     JSON.stringify({
//       type: "Employee",
//     })
//   );
//   const html = NewBillUI();
//   document.body.innerHTML = html;

//   const newNewBill = new NewBill({
//     document,
//     onNavigate,
//     store: mockStore,
//     localStorage: window.localStorage,
//   });
//   const handleChangeFile = jest.fn((e) => newNewBill.handleChangeFile(e));
//   const newBillsfile = screen.getByTestId("file");
//   const file = new File(["picture"], "test.jpg", { type: "image/jpg" });
//   newBillsfile.textContent = test.jpg;
//   //newBillsfile.addEventListener("click", handleChangeFile);
//   //expect(handleChangeFile).toHaveBeenCalled();
//   fireEvent.change(newBillsfile, file);
//   expect(newBillsfile.textContent).toContain("jpg");
//   //   const alertExtension = screen.getByTestId("alertExtension");
//   //   expect(alertExtension.textContent).toBe("");
// });

// describe("Given I am a user connected as Employee", () => {
//   describe("When I create a new bill", () => {
//     test("send new bill from mock API Post", async () => {
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//           email: "a@a",
//         })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();

//       document.body.innerHTML = NewBillUI();

//       const newNewBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorage: window.localStorage,
//       });

//       const btnBill = screen.getByTestId("form-new-bill");
//       const handleSubmit = jest.fn(newNewBill.handleSubmit);
//       btnBill.addEventListener("submit", handleSubmit);
//       fireEvent.submit(btnBill);
//       expect(handleSubmit).toHaveBeenCalled();
//     });
//     test("It should call handleChangeFile() and not send an alert", () => {
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.NewBill);

//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname });
//       };
//       const newBill = new NewBill({
//         document,
//         onNavigate,
//         store,
//         locolaStorage: window.localStorage,
//       });
//       jest.spyOn(window, "alert");
//       const file = document.querySelector(`input[data-testid="file"]`);
//       const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
//       file.addEventListener("change", handleChangeFile);
//       fireEvent.change(file, {
//         target: {
//           files: [new File([], "fakeFile.jpg", { type: "image/jpg" })],
//         },
//       });

//       expect(handleChangeFile).toHaveBeenCalled();
//       expect(window.alert).not.toHaveBeenCalled();
//     });
//     test("Then it should call handleSubmit() and updateBill()", () => {
//       jest.spyOn(mockStore, "bills");

//       const html = NewBillUI();
//       document.body.innerHTML = html;

//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname });
//       };

//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//           email: "a@a",
//         })
//       );

//       const newBillJs = new NewBill({
//         document,
//         onNavigate,
//         store: null,
//         localStorage: window.localStorage,
//       });

//       const handleChangeFile = jest.fn((e) => newBillJs.handleChangeFile(e));
//       const uploadInput = screen.getByTestId("file");
//       const form = screen.getByTestId("form-new-bill");
//       const handleSubmit = jest.fn((e) => newBillJs.handleSubmit(e));

//       uploadInput.addEventListener("change", handleChangeFile);
//       newBillJs.updateBill = jest.fn();

//       const validBill = {
//         type: "Transport",
//         name: "Train Paris Bordeaux",
//         date: "2022-07-02",
//         amount: 350,
//         vat: 70,
//         pct: 20,
//         commentary: "Prix billet TGV : 350€",
//         fileUrl: "../img/fakeFile.jpg",
//         fileName: "billet-tgv.jpg",
//         status: "pending",
//       };

//       screen.getByTestId("expense-type").value = validBill.type;
//       screen.getByTestId("expense-name").value = validBill.name;
//       screen.getByTestId("datepicker").value = validBill.date;
//       screen.getByTestId("amount").value = validBill.amount;
//       screen.getByTestId("vat").value = validBill.vat;
//       screen.getByTestId("pct").value = validBill.pct;
//       screen.getByTestId("commentary").value = validBill.commentary;
//       newBillJs.fileName = validBill.fileName;
//       newBillJs.fileUrl = validBill.fileUrl;

//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(handleSubmit).toHaveBeenCalled();
//       expect(newBillJs.updateBill).toHaveBeenCalled();
//     });
//   });

//   describe("When an error occurs on API", () => {
//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills");

//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//           email: "a@a",
//         })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.appendChild(root);
//       router();
//     });

//     test("fetches bills from an API and fails with 404 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list: () => {
//             return Promise.reject(new Error("Erreur 404"));
//           },
//         };
//       });
//       window.onNavigate(ROUTES_PATH.Bills);
//       await new Promise(process.nextTick);
//       const error404Page = BillsUI({ error: "Erreur 404" });
//       document.body.innerHTML = error404Page;
//       const verificationUrl404 = await waitFor(() =>
//         screen.getByText(/Erreur 404/)
//       );
//       expect(verificationUrl404).toBeTruthy();
//     });

//     test("fetches messages from an API and fails with 500 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list: () => {
//             return Promise.reject(new Error("Erreur 500"));
//           },
//         };
//       });

//       window.onNavigate(ROUTES_PATH.Bills);
//       await new Promise(process.nextTick);
//       const error500Page = BillsUI({ error: "Erreur 500" });
//       document.body.innerHTML = error500Page;
//       const verificationUrl500 = await waitFor(() =>
//         screen.getByText(/Erreur 500/)
//       );
//       expect(verificationUrl500).toBeTruthy();
//     });
//   });
// });

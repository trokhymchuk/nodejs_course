import { BookService } from "./bookService";
import { UserService } from "./userService";
import { LoanService } from "./loanService";

export const bookService = new BookService();
export const userService = new UserService();
export const loanService = new LoanService(bookService, userService);

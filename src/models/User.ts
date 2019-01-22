export default interface User {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  account: {
    address1: string;
    address2: string;
    defaultRefundMethodId: string;
    displayName: string;
    dob: number;
    firstName: string;
    passportNo: string;
    residenceCity: string;
    residenceCountry: string;
    surname: string;
  };
  lastActive: number;
  meta: {
    creationTime: number;
  };
}

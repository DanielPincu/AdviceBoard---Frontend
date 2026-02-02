export interface Advice {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  anonymous: boolean;
  _createdBy: string;
}
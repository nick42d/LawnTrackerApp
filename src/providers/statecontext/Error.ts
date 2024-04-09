export class StateContextError extends Error {
  name: 'DELETE_LOCATIONS_ERROR' | 'ADD_LOCATIONS_ERROR';
  message: string;
  cause: any;
  constructor({
    name,
    message,
    cause,
  }: {
    name: 'DELETE_LOCATIONS_ERROR' | 'ADD_LOCATIONS_ERROR';
    message: string;
    cause?: any;
  }) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}

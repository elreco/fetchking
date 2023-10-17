import { fexios } from '../src/index';
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

describe('Fexios', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should perform a GET request', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: 'some data' }));
    const api = fexios.create({ baseURL: 'https://jsonplaceholder.typicode.com' });
    const data = await api.get('/todos/1');

    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      expect.objectContaining({ method: 'GET' })
    );
    expect(data).toEqual({ data: 'some data' });
  });

  it('should perform a POST request', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: 'some data' }));
    const api = fexios.create({ baseURL: 'https://jsonplaceholder.typicode.com' });
    const newTodo = { title: 'Test todo', userId: 1 };
    const data = await api.post('/todos', newTodo);

    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newTodo),
      })
    );
    expect(data).toEqual({ data: 'some data' });
  });
});

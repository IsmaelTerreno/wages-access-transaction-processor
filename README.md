# Wage Access Transaction Processor

## Description used to build the project

### Overview

You are tasked with creating a simplified version of a transaction processor for an earned wage access platform. This
platform allows employees in LATAM countries working for US companies to access their earned wages in real-time before
payday. The challenge involves calculating the available balance, processing requests for wage access, and handling
currency conversion rates.

### Requirements

| Input/Output:                                                                                                                                          | Data Structure                                                                                      | Functionality                                                                                                                                            | Constraints                                                                                          |
|--------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| Your program should read from a provided JSON file (sample_wage_data.json) that includes employee wage data, currency rates, and wage access requests. | Employee Wage Data: Includes employee ID, total earned wages, and currency (USD or local currency). | Balance Calculation: Calculate the real-time balance of an employee's earned wages, accounting for any previous wage access requests.                    | An employee cannot access more than their available earned wages.                                    |
| Output should be a JSON file with the results of each wage access request, including approval status and remaining balance.                            | Currency Rates: Conversion rates between USD and local currencies.                                  | Request Processing: Determine if a wage access request can be approved based on the available balance and the requested amount.                          | Currency conversion rates should be applied accurately, considering the rates might fluctuate daily. |
|                                                                                                                                                        | Wage Access Requests: Includes request ID, employee ID, requested amount, and requested currency.   | Currency Conversion: If a request is made in a currency different from the earned wages, convert the requested amount using the provided currency rates. |                                                                                                      |

### Evaluation Criteria

* Correctness: The solution should accurately process all wage access requests, correctly applying balance checks and
  currency conversions.
* Code Quality: Code should be clean, well-commented, and organized. Proper error handling and validation of input data
  are expected.
* Efficiency: The solution should handle data efficiently, with consideration for time and space complexity, especially
  as the size of the dataset grows.

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository was used on this project.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If
you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

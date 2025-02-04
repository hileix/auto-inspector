import { Command, program } from 'commander';
import ora from 'ora';

export const startTest = new Command('test:start')
    .description('Start a test execution')
    .option('-u, --url <URL>', 'The webpage to start testing')
    .option('-d, --description', 'The description of the test')
    .action(async (
        options: {
            url: string,
            description: string,
        }
    ) => {
        const spinner = ora('Running tests...').start();

        await new Promise((resolve) => setTimeout(resolve, 1000));

        program.error('This command is not implemented yet');
    });

export default {
    startTest,
};
#!/usr/bin/env node

import { Command } from 'commander';
import { startTest } from './commands/index.js';
import metadata from '../package.json' with { 'type': 'json' }

const program = new Command();

program
    .version(metadata.version)
    .description('Magic Inspector API CLI')
;

program.addCommand(startTest);

program.parse(process.argv);
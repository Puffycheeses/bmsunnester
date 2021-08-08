/*
 * bmsnestfixer - UnNest BMS directories
 * Copyright (C) 2021 pfych (contact@pfy.ch)
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of  MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import fs from 'fs';
import path from 'path';

// EDIT THESE VARIABLES!
const BMS_DIRECTORY = 'd:\\BMS';
const DELETE_OLD_FOLDERS = true;

// Create an array of all our nested paths
const bmsFolders = fs.readdirSync(BMS_DIRECTORY);
let nestedPaths = []
bmsFolders.forEach(folder => {
  const folderPath = path.join(BMS_DIRECTORY, folder)
  const folderContents = fs.readdirSync(folderPath)

  if (folderContents.length !== 1) {
    return;
  }

  nestedPaths.push({
    moveFrom: path.join(folderPath, folderContents[0]),
    moveTo: folderPath
  })
})

// Move the files
let failedDeletes = []
nestedPaths.forEach((paths, i) => {
  if ( fs.lstatSync(paths.moveFrom).isDirectory() ) {
    console.log(`[${i + 1}/${nestedPaths.length}] Moving: ${paths.moveFrom} > ${paths.moveTo}`)

    fs.readdirSync(paths.moveFrom).forEach(file => {
      const oldFileLocation = path.join(paths.moveFrom, file)
      const newFileLocation = path.join(paths.moveTo, file)

      fs.renameSync(oldFileLocation, newFileLocation)
    })

    if(DELETE_OLD_FOLDERS) {
      try {
        fs.rmdirSync(paths.moveFrom, {maxRetries: 4, retryDelay: 250})
      } catch {
        failedDeletes.push(paths.moveFrom)
      }
    }
  }
})

console.log("The following folders failed to delete:")
console.log(failedDeletes)
console.log("Attempting to delete again:")

failedDeletes.forEach(failed => {
  try {
    fs.rmdirSync(failed, {maxRetries: 4, retryDelay: 250})
  } catch {
    console.log(`fail: ${failed}`)
  }
})

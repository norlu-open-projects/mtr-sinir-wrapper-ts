/*
 * Copyright (c) 2026, Stallone L. de Souza (@stallone-dev)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getLogger } from "@logtape";
import { trace } from "@opentelemetry";

export const logger = getLogger(["mtr-wrapper-ts"]);
export const tracer = trace.getTracer("mtr-wrapper-ts", "0.2.0");

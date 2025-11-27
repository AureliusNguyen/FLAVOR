"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBonawitz } from "@/context/bonawitz-context";
import { MathBlock, Math as MathTex } from "@/components/math";
import {
  Radio,
  CheckCircle,
  XCircle,
  Server,
  Users,
  ArrowRight,
  AlertTriangle,
  Shield,
  WifiOff,
} from "lucide-react";

interface Props {
  currentStep: number;
}

export function BonawitzConsistencyCheckSection({ currentStep }: Props) {
  const { clients, config, protocolData } = useBonawitz();

  // U₁ \ U₂ = Early dropouts (dropped after Round 1, before submitting)
  const earlyDropouts = clients.filter((c) => c.dropoutPhase === "after_share_keys");

  // U₂ = clients who submitted masked inputs in Round 2
  const u2Clients = clients.filter(
    (c) => c.dropoutPhase === "alive" || c.dropoutPhase === "after_masked_input"
  );

  // U₂ \ U₃ = Late dropouts (submitted but then disconnected)
  const lateDropouts = clients.filter((c) => c.dropoutPhase === "after_masked_input");

  // U₃ = clients who are still alive and will participate in Round 4
  const u3Clients = clients.filter((c) => c.dropoutPhase === "alive");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-foreground pb-26">
      {/* Step 0: Round 3 Overview */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 3</Badge>
            <h2 className="text-3xl font-bold mb-2">Consistency Check</h2>
            <p className="text-muted-foreground">
              Server announces which clients are still participating
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Radio className="h-5 w-5 text-yellow-400" />
                Why Round 3 is Necessary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                After Round 2 (Masked Input Collection), some clients may have
                dropped out. Before unmasking can proceed,{" "}
                <strong>
                  all remaining clients must agree on exactly which clients are
                  still participating
                </strong>
                .
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-blue-900/30 border-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-5 w-5 text-blue-400" />
                      <p className="font-semibold text-blue-300">
                        Server's Role
                      </p>
                    </div>
                    <p className="text-sm text-foreground/80">
                      The server broadcasts the set <MathTex>{"U_3"}</MathTex> —
                      the list of clients who responded in Round 2 and are still
                      online.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-green-400" />
                      <p className="font-semibold text-green-300">
                        Clients' Role
                      </p>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Each client in <MathTex>{"U_3"}</MathTex> acknowledges
                      they will participate in Round 4 (unmasking phase).
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-yellow-900/30 border-yellow-500">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  <strong>Critical for Security:</strong> Without this step,
                  clients wouldn't know whose self-masks need to be
                  reconstructed, potentially leading to incorrect aggregation or
                  privacy leaks.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Set Definitions */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Client Sets</h2>
            <p className="text-muted-foreground">
              Understanding the different client sets in the protocol
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Set Definitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* U2 Definition */}
                <div className="bg-muted p-4 rounded-lg border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MathTex>{"U_2"}</MathTex>
                    <span className="text-cyan-300 font-semibold">
                      — Clients who submitted masked inputs
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-3">
                    These clients successfully completed Round 2 by sending
                    their masked input <MathTex>{"y_u"}</MathTex> to the server.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {u2Clients.map((c) => (
                      <Badge
                        key={c.id}
                        style={{ backgroundColor: c.color }}
                        className="text-white"
                      >
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    |<MathTex>{"U_2"}</MathTex>| ={" "}
                    <MathTex>{u2Clients.length.toString()}</MathTex> clients
                  </p>
                </div>

                {/* U3 Definition */}
                <div className="bg-muted p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MathTex>{"U_3"}</MathTex>
                    <span className="text-green-300 font-semibold">
                      — Clients alive after Round 3
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-3">
                    These clients are still online and will participate in Round
                    4 (unmasking). They will reveal their self-mask{" "}
                    <MathTex>{"b_u"}</MathTex> directly.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {u3Clients.map((c) => (
                      <Badge
                        key={c.id}
                        style={{ backgroundColor: c.color }}
                        className="text-white"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    |<MathTex>{"U_3"}</MathTex>| ={" "}
                    <MathTex>{u3Clients.length.toString()}</MathTex> clients
                  </p>
                </div>

                {/* U1 \ U2 Definition - Early dropouts */}
                <div className="bg-muted p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MathTex>{"U_1 \\setminus U_2"}</MathTex>
                    <span className="text-orange-300 font-semibold">
                      — Early dropouts (before submitting)
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-3">
                    These clients completed key exchange but disconnected before Round 2.
                    Their <strong>pairwise keys</strong> <MathTex>{"s_{uv}"}</MathTex> must be
                    reconstructed so other clients can remove pairwise masks.
                    Their gradient is <strong>not</strong> included in the sum.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {earlyDropouts.length > 0 ? (
                      earlyDropouts.map((c) => (
                        <Badge
                          key={c.id}
                          variant="outline"
                          className="border-orange-500 text-orange-300"
                        >
                          <WifiOff className="h-3 w-3 mr-1" />
                          {c.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        No early dropouts
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    |<MathTex>{"U_1 \\setminus U_2"}</MathTex>| ={" "}
                    <MathTex>{earlyDropouts.length.toString()}</MathTex> clients
                  </p>
                </div>

                {/* U2 \ U3 Definition - Late dropouts */}
                <div className="bg-muted p-4 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MathTex>{"U_2 \\setminus U_3"}</MathTex>
                    <span className="text-red-300 font-semibold">
                      — Late dropouts (after submitting)
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-3">
                    These clients submitted their masked input but then dropped
                    out. Their self-mask <MathTex>{"b_u"}</MathTex> must be{" "}
                    <strong>reconstructed via Shamir Secret Sharing</strong>.
                    Their gradient <strong>is</strong> included in the sum.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lateDropouts.length > 0 ? (
                      lateDropouts.map((c) => (
                        <Badge
                          key={c.id}
                          variant="outline"
                          className="border-red-500 text-red-300"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          {c.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        No late dropouts
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    |<MathTex>{"U_2 \\setminus U_3"}</MathTex>| ={" "}
                    <MathTex>{lateDropouts.length.toString()}</MathTex> clients
                  </p>
                </div>
              </div>

              {/* Threshold Check */}
              <Card
                className={`${
                  u3Clients.length >= config.T
                    ? "bg-green-900/30 border-green-500"
                    : "bg-red-900/30 border-red-500"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield
                      className={`h-5 w-5 ${
                        u3Clients.length >= config.T
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    />
                    <p
                      className={`font-semibold ${
                        u3Clients.length >= config.T
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      Threshold Check: |<MathTex>{"U_3"}</MathTex>|{" "}
                      {u3Clients.length >= config.T ? "≥" : "<"}{" "}
                      <MathTex>{"T"}</MathTex>
                    </p>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {u3Clients.length >= config.T ? (
                      <>
                        <strong className="text-green-300">
                          Protocol can proceed!
                        </strong>{" "}
                        We have {u3Clients.length} alive clients, which is{" "}
                        <MathTex>{"\\geq T = "}</MathTex>{" "}
                        <MathTex>{config.T.toString()}</MathTex>. There are
                        enough shares to reconstruct any dropped client's
                        secrets.
                      </>
                    ) : (
                      <>
                        <strong className="text-red-300">
                          Protocol cannot proceed!
                        </strong>{" "}
                        Only {u3Clients.length} alive clients, but we need at
                        least T = {config.T} for reconstruction.
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 2: Broadcast Visualization */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Server Broadcast</h2>
            <p className="text-muted-foreground">
              Server announces the set <MathTex>{"U_3"}</MathTex> to all participants
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6">
                {/* Server */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-purple-900/50 p-6 rounded-xl border-2 border-purple-500"
                >
                  <div className="flex items-center gap-3">
                    <Server className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="font-bold text-purple-300 text-lg">
                        Server
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Broadcasting <MathTex>{"U_3"}</MathTex>
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Broadcast arrows */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex gap-4">
                    {u3Clients
                      .slice(0, Math.min(5, u3Clients.length))
                      .map((_, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                          <ArrowRight className="h-6 w-6 text-purple-400 rotate-90" />
                        </motion.div>
                      ))}
                  </div>
                  <p className="text-sm text-purple-300 font-mono">
                    Clients in <MathTex>{"U_3"}</MathTex>: [{u3Clients.map(c => c.id).join(', ')}]
                  </p>
                </motion.div>

                {/* Clients */}
                <div className="flex flex-wrap justify-center gap-4">
                  {clients.map((client, idx) => {
                    const isInU3 = u3Clients.some((c) => c.id === client.id);
                    const isEarlyDropout = earlyDropouts.some((c) => c.id === client.id);
                    const isLateDropout = lateDropouts.some((c) => c.id === client.id);

                    return (
                      <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isEarlyDropout ? 0.4 : (isLateDropout ? 0.6 : 1), y: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className={`p-4 rounded-lg border-2 ${
                          isEarlyDropout
                            ? "border-orange-500/50 bg-orange-900/20"
                            : isLateDropout
                            ? "border-red-500/50 bg-red-900/20"
                            : "border-green-500 bg-green-900/20"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              !isInU3 ? "opacity-50" : ""
                            }`}
                            style={{ backgroundColor: client.color }}
                          >
                            {client.id}
                          </div>
                          <p
                            className={`text-sm font-medium ${
                              !isInU3
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {client.name}
                          </p>
                          {isInU3 ? (
                            <Badge className="bg-green-600 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              In <MathTex>{"U_3"}</MathTex>
                            </Badge>
                          ) : isEarlyDropout ? (
                            <Badge
                              variant="outline"
                              className="border-orange-500 text-orange-300 text-xs"
                            >
                              <WifiOff className="h-3 w-3 mr-1" />
                              Early dropout
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-red-500 text-red-300 text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Late dropout
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What happens next */}
          <Card className="bg-muted border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                What Happens Next in Round 4?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="bg-green-600 mt-1">1</Badge>
                <p className="text-foreground/80">
                  <strong>
                    Alive clients (<MathTex>{"U_3"}</MathTex>)
                  </strong>{" "}
                  will reveal their self-mask <MathTex>{"b_u"}</MathTex> directly to the server.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-orange-600 mt-1">2</Badge>
                <p className="text-foreground/80">
                  <strong>
                    Early dropouts (<MathTex>{"U_1 \\setminus U_2"}</MathTex>)
                  </strong>{" "}
                  — their <strong>private key</strong> <MathTex>{"a_u"}</MathTex> is reconstructed
                  to compute pairwise masks with remaining clients. No self-mask needed since they didn't submit.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-red-600 mt-1">3</Badge>
                <p className="text-foreground/80">
                  <strong>
                    Late dropouts (<MathTex>{"U_2 \\setminus U_3"}</MathTex>)
                  </strong>{" "}
                  — their self-mask <MathTex>{"b_u"}</MathTex> is reconstructed
                  using Shamir shares held by alive clients.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-purple-600 mt-1">4</Badge>
                <p className="text-foreground/80">
                  <strong>Server</strong> removes all masks to recover{" "}
                  <MathTex>{"\\sum_{u \\in U_2} x_u"}</MathTex>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert className="bg-blue-900/30 border-blue-500">
            <AlertDescription className="text-blue-200">
              <strong>Round 3 Complete:</strong> All clients now know exactly
              who is in <MathTex>{"U_3"}</MathTex> and can proceed to Round 4
              (Unmasking) where the aggregate will be recovered.
            </AlertDescription>
          </Alert>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="flex items-center justify-center py-4">
              <p className="text-center text-purple-200">
                <strong>Next:</strong> Alive clients in <MathTex>{"U_3"}</MathTex> will reveal their self-masks <MathTex>{"b_u"}</MathTex> directly,
                while the server reconstructs dropped clients' masks via Shamir Secret Sharing to recover the true aggregate <MathTex>{"\\sum_{u \\in U_2} x_u"}</MathTex>.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}

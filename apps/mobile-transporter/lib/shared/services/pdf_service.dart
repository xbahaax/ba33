import 'dart:typed_data';

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../features/jobs/model/transport_job.dart';

abstract class PdfService {
  static Future<Uint8List> generateProofOfDelivery(
      ActiveTripState trip) async {
    final pdf = pw.Document();
    final job = trip.job;
    final now = DateTime.now();
    final dateStr =
        '${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year}  ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    pw.MemoryImage? signatureImage;
    if (trip.signatureBytes != null) {
      signatureImage = pw.MemoryImage(trip.signatureBytes!);
    }

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(40),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // ── Header ──────────────────────────────
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        'ba33',
                        style: pw.TextStyle(
                          fontSize: 28,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                      pw.Text(
                        'Plateforme NFN — Traçabilité laine',
                        style: const pw.TextStyle(
                          fontSize: 9,
                          color: PdfColors.grey600,
                        ),
                      ),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        'BON DE LIVRAISON',
                        style: pw.TextStyle(
                          fontSize: 16,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                      pw.Text(
                        dateStr,
                        style: const pw.TextStyle(
                          fontSize: 9,
                          color: PdfColors.grey600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              pw.Divider(thickness: 1.5, color: PdfColors.grey400),
              pw.SizedBox(height: 16),

              // ── Mission info ─────────────────────────
              pw.Container(
                padding: const pw.EdgeInsets.all(12),
                decoration: pw.BoxDecoration(
                  color: PdfColors.grey100,
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
                ),
                child: pw.Row(
                  children: [
                    _infoBlock('N° Mission', job.id),
                    pw.SizedBox(width: 24),
                    _infoBlock('Couloir',
                        job.lane == TransportLane.urgentColdChain
                            ? 'URGENT FROID'
                            : job.lane == TransportLane.urgentStandard
                                ? 'URGENT'
                                : 'NORMAL'),
                    pw.SizedBox(width: 24),
                    _infoBlock('Lots transportés', '${job.lots.length}'),
                  ],
                ),
              ),
              pw.SizedBox(height: 16),

              // ── Route ────────────────────────────────
              pw.Row(
                children: [
                  pw.Expanded(
                    child: _infoBlock('Origine', job.originName,
                        sub: job.originType.toUpperCase()),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.symmetric(horizontal: 8),
                    child: pw.Text('→',
                        style: pw.TextStyle(
                            fontSize: 18, fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Expanded(
                    child: _infoBlock('Destination', job.destinationName,
                        sub: job.destinationType.toUpperCase()),
                  ),
                ],
              ),
              pw.SizedBox(height: 20),

              // ── Lots table ───────────────────────────
              pw.Text(
                'DÉTAIL DES LOTS',
                style: pw.TextStyle(
                  fontSize: 10,
                  fontWeight: pw.FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),
              pw.SizedBox(height: 6),
              pw.Table(
                columnWidths: {
                  0: const pw.FlexColumnWidth(3),
                  1: const pw.FlexColumnWidth(1),
                  2: const pw.FlexColumnWidth(1.5),
                  3: const pw.FlexColumnWidth(1.5),
                  4: const pw.FlexColumnWidth(1.5),
                  5: const pw.FlexColumnWidth(1),
                },
                border: pw.TableBorder.all(
                    color: PdfColors.grey300, width: 0.5),
                children: [
                  // Header row
                  pw.TableRow(
                    decoration:
                        const pw.BoxDecoration(color: PdfColors.grey200),
                    children: [
                      _tableCell('CODE QR', isHeader: true),
                      _tableCell('SRC', isHeader: true),
                      _tableCell('DÉCLARÉ', isHeader: true),
                      _tableCell('CHARGÉ', isHeader: true),
                      _tableCell('LIVRÉ', isHeader: true),
                      _tableCell('STATUT', isHeader: true),
                    ],
                  ),
                  // Data rows
                  ...job.lots.map((lot) {
                    final mismatch = lot.hasMismatch;
                    return pw.TableRow(
                      decoration: mismatch
                          ? const pw.BoxDecoration(color: PdfColors.red50)
                          : null,
                      children: [
                        _tableCell(lot.qrCode, mono: true),
                        _tableCell(lot.sourceType),
                        _tableCell(
                            '${lot.declaredWeight.toStringAsFixed(1)} kg'),
                        _tableCell(
                            '${(lot.loadedWeight ?? lot.declaredWeight).toStringAsFixed(1)} kg'),
                        _tableCell(
                            '${(lot.deliveredWeight ?? lot.loadedWeight ?? lot.declaredWeight).toStringAsFixed(1)} kg'),
                        _tableCell(
                          mismatch ? '⚠ ÉCART' : '✓ OK',
                          color:
                              mismatch ? PdfColors.red : PdfColors.green700,
                        ),
                      ],
                    );
                  }),
                  // Total row
                  pw.TableRow(
                    decoration:
                        const pw.BoxDecoration(color: PdfColors.grey200),
                    children: [
                      _tableCell('TOTAL', isHeader: true),
                      _tableCell(''),
                      _tableCell(
                        '${job.totalDeclaredWeight.toStringAsFixed(1)} kg',
                        isHeader: true,
                      ),
                      _tableCell(
                        '${job.totalLoadedWeight.toStringAsFixed(1)} kg',
                        isHeader: true,
                      ),
                      _tableCell(
                        '${job.totalDeliveredWeight.toStringAsFixed(1)} kg',
                        isHeader: true,
                      ),
                      _tableCell(
                        job.hasMismatch ? '⚠' : '✓',
                        color: job.hasMismatch
                            ? PdfColors.red
                            : PdfColors.green700,
                      ),
                    ],
                  ),
                ],
              ),
              pw.SizedBox(height: 20),

              // ── Temperature log (cold chain) ─────────
              if (trip.temperatureReadings.isNotEmpty) ...[
                pw.Text(
                  'RELEVÉS TEMPÉRATURE (CHAÎNE DU FROID)',
                  style: pw.TextStyle(
                      fontSize: 10,
                      fontWeight: pw.FontWeight.bold,
                      letterSpacing: 1),
                ),
                pw.SizedBox(height: 6),
                pw.Table(
                  border:
                      pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
                  children: [
                    pw.TableRow(
                      decoration:
                          const pw.BoxDecoration(color: PdfColors.grey200),
                      children: [
                        _tableCell('HEURE', isHeader: true),
                        _tableCell('TEMPÉRATURE', isHeader: true),
                        _tableCell('STATUT', isHeader: true),
                      ],
                    ),
                    ...trip.temperatureReadings.map((r) {
                      final t = r.recordedAt;
                      final timeStr =
                          '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
                      return pw.TableRow(
                        decoration: r.isAlert
                            ? const pw.BoxDecoration(color: PdfColors.red50)
                            : null,
                        children: [
                          _tableCell(timeStr, mono: true),
                          _tableCell('${r.temperature.toStringAsFixed(1)} °C',
                              mono: true),
                          _tableCell(r.isAlert ? '⚠ ALERTE' : '✓ OK',
                              color: r.isAlert
                                  ? PdfColors.red
                                  : PdfColors.green700),
                        ],
                      );
                    }),
                  ],
                ),
                pw.SizedBox(height: 20),
              ],

              // ── Receiver + signature ─────────────────
              pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'RÉCEPTIONNÉ PAR',
                          style: pw.TextStyle(
                              fontSize: 9,
                              fontWeight: pw.FontWeight.bold,
                              letterSpacing: 1,
                              color: PdfColors.grey600),
                        ),
                        pw.SizedBox(height: 4),
                        pw.Text(
                          trip.receiverName ?? 'Réceptionnaire',
                          style: pw.TextStyle(
                              fontSize: 14,
                              fontWeight: pw.FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  if (signatureImage != null)
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            'SIGNATURE',
                            style: pw.TextStyle(
                                fontSize: 9,
                                fontWeight: pw.FontWeight.bold,
                                letterSpacing: 1,
                                color: PdfColors.grey600),
                          ),
                          pw.SizedBox(height: 4),
                          pw.Container(
                            height: 80,
                            decoration: pw.BoxDecoration(
                              border:
                                  pw.Border.all(color: PdfColors.grey300),
                              borderRadius: const pw.BorderRadius.all(
                                  pw.Radius.circular(4)),
                            ),
                            child: pw.Image(signatureImage, fit: pw.BoxFit.contain),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              pw.Spacer(),

              // ── Footer ───────────────────────────────
              pw.Divider(color: PdfColors.grey300),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text(
                    'ba33 — Plateforme NFN de traçabilité laine / Algérie',
                    style: const pw.TextStyle(
                        fontSize: 8, color: PdfColors.grey500),
                  ),
                  pw.Text(
                    'Document généré automatiquement — non modifiable',
                    style: const pw.TextStyle(
                        fontSize: 8, color: PdfColors.grey500),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  static Future<void> sharePoD(ActiveTripState trip) async {
    final bytes = await generateProofOfDelivery(trip);
    await Printing.sharePdf(
      bytes: bytes,
      filename: 'PoD-${trip.job.id}.pdf',
    );
  }

  static pw.Widget _infoBlock(String label, String value, {String? sub}) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(
          label,
          style: const pw.TextStyle(
              fontSize: 8, color: PdfColors.grey600),
        ),
        pw.Text(
          value,
          style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold),
        ),
        if (sub != null)
          pw.Text(sub,
              style:
                  const pw.TextStyle(fontSize: 8, color: PdfColors.grey500)),
      ],
    );
  }

  static pw.Widget _tableCell(
    String text, {
    bool isHeader = false,
    bool mono = false,
    PdfColor? color,
  }) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      child: pw.Text(
        text,
        style: pw.TextStyle(
          fontSize: isHeader ? 8 : 9,
          fontWeight: isHeader ? pw.FontWeight.bold : pw.FontWeight.normal,
          color: color ?? (isHeader ? PdfColors.grey700 : PdfColors.black),
        ),
      ),
    );
  }
}

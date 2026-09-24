<?php

namespace App\Contracts;

use App\Models\Venta;

interface SunatProvider
{
    public function isConfigured(): bool;

    /**
     * Emitir comprobante (Factura '01' o Boleta '03').
     *
     * @return array{status: string, documentId?: mixed, error?: array, fileName?: string}
     */
    public function emitirComprobante(Venta $venta, string $tipoDoc = '03'): array;

    /**
     * Consultar el estado de un documento ya emitido.
     *
     * @param  string  $documentId  ID/identificador devuelto por emitirComprobante
     * @param  Venta|null  $venta   venta asociada (la usa la plataforma para resolver tipo boleta/factura)
     */
    public function getEstado(string $documentId, ?Venta $venta = null): array;

    /**
     * URL del PDF de representación impresa.
     *
     * @param  string  $documentId  ID/identificador devuelto por emitirComprobante
     * @param  string  $fileName    nombre del archivo (sin .pdf)
     * @param  string  $format      A4 | A5 | ticket58mm | ticket80mm | a4 | ticket-80 | ...
     */
    public function getPDFUrl(string $documentId, string $fileName, string $format = ''): string;

    /**
     * Construir el fileName SUNAT: RRRRRRRRRR-TT-SSSS-CCCCCCCC
     */
    public function buildFileName(Venta $venta, string $tipoDoc): string;

    /**
     * Construir el ID SUNAT del documento: SERIE-CCCCCCCC (8 dígitos).
     */
    public function buildDocumentId(Venta $venta): string;

    /**
     * Determinar el tipo de documento de identidad del cliente.
     *
     * @return string schemeID: '6'=RUC, '1'=DNI, '0'=Sin doc
     */
    public function getCustomerDocType(?string $rucDni): string;
}
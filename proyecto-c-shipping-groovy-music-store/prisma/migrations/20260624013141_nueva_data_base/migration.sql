/*
  Warnings:

  - The primary key for the `Direccion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Empresa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Envio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `direccion_id` on the `Envio` table. All the data in the column will be lost.
  - The primary key for the `EventoDeEnvio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[order_id]` on the table `Envio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo_seguimiento]` on the table `Envio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo_seguimiento` to the `Envio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion_destino_id` to the `Envio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_entrega_estimada` to the `Envio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Envio" DROP CONSTRAINT "Envio_direccion_id_fkey";

-- DropForeignKey
ALTER TABLE "Envio" DROP CONSTRAINT "Envio_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "EventoDeEnvio" DROP CONSTRAINT "EventoDeEnvio_envio_id_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_empresaId_fkey";

-- AlterTable
ALTER TABLE "Direccion" DROP CONSTRAINT "Direccion_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Direccion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Direccion_id_seq";

-- AlterTable
ALTER TABLE "Empresa" DROP CONSTRAINT "Empresa_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Empresa_id_seq";

-- AlterTable
ALTER TABLE "Envio" DROP CONSTRAINT "Envio_pkey",
DROP COLUMN "direccion_id",
ADD COLUMN     "codigo_seguimiento" TEXT NOT NULL,
ADD COLUMN     "direccion_destino_id" TEXT NOT NULL,
ADD COLUMN     "direccion_origen_id" TEXT,
ADD COLUMN     "fecha_entrega_estimada" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "seller_id" SET DATA TYPE TEXT,
ALTER COLUMN "buyer_id" SET DATA TYPE TEXT,
ALTER COLUMN "empresaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Envio_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Envio_id_seq";

-- AlterTable
ALTER TABLE "EventoDeEnvio" DROP CONSTRAINT "EventoDeEnvio_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "envio_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "EventoDeEnvio_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EventoDeEnvio_id_seq";

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "empresaId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Envio_order_id_key" ON "Envio"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Envio_codigo_seguimiento_key" ON "Envio"("codigo_seguimiento");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_direccion_destino_id_fkey" FOREIGN KEY ("direccion_destino_id") REFERENCES "Direccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_direccion_origen_id_fkey" FOREIGN KEY ("direccion_origen_id") REFERENCES "Direccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoDeEnvio" ADD CONSTRAINT "EventoDeEnvio_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "Envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

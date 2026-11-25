--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: refund_reason; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.refund_reason (id, label, description, metadata, created_at, updated_at, deleted_at, code) VALUES ('refr_01M7A426WHFH993PARW9NJD103', 'Shipping Issue', 'Refund due to lost, delayed, or misdelivered shipment', NULL, '2026-11-13 09:33:18.200266+00', '2026-11-13 09:33:18.200266+00', NULL, 'shipping_issue');
INSERT INTO public.refund_reason (id, label, description, metadata, created_at, updated_at, deleted_at, code) VALUES ('refr_01M7A426WHY3KZ570V5V6BASR9', 'Customer Care Adjustment', 'Refund given as goodwill or compensation for inconvenience', NULL, '2026-11-13 09:33:18.200266+00', '2026-11-13 09:33:18.200266+00', NULL, 'customer_care_adjustment');
INSERT INTO public.refund_reason (id, label, description, metadata, created_at, updated_at, deleted_at, code) VALUES ('refr_01M7A426WJ0C12PA9T864Z156A', 'Pricing Error', 'Refund to correct an overcharge, missing discount, or incorrect price', NULL, '2026-11-13 09:33:18.200266+00', '2026-11-13 09:33:18.200266+00', NULL, 'pricing_error');


--
-- PostgreSQL database dump complete
--

